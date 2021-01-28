import { fetchRetriable } from './connection';

import { ASYNC_STORAGE_KEYS } from '../../constants';
import { logger } from '../../utility/logger';
import { DescribeLayoutResult, CompositeLayoutResponse } from '../../../src/types/metadata';
import { formatISOStringToAPIDate } from '../../utility/date';

const SALESFORCE_API_VERSION = 'v49.0';

/**
 * @description Execute SOQL and return records
 * @param query SOQL
 * @return records
 */
export const fetchSalesforceRecords = async (query: string) => {
  const endPoint = (await buildEndpointUrl()) + `/query?q=${query}`;
  const response = await fetchRetriable(endPoint, 'GET', undefined);
  // Error response of Salesforce REST API is array format.
  const hasError = Array.isArray(response);
  if (hasError) {
    logger('ERROR', 'fetchSalesforceRecords', response);
    return Promise.reject({ origin: 'query' });
  }
  return response.totalSize === 0
    ? []
    : response.records.map(r => {
        delete r.attributes;
        return r;
      });
};

/**
 * @description Retrieve record details using composite resource
 * @param sObjectType
 * @param records
 */
export const fetchSalesforceRecordsByIds = async (
  sObjectType: string,
  recordIds: Array<string>,
  commaSeparetedFields: string
) => {
  const endPoint = (await buildEndpointUrl()) + '/composite';
  const body = {
    allOrNone: true,
    compositeRequest: [],
  };
  for (const recordId of recordIds) {
    body.compositeRequest.push({
      method: 'GET',
      referenceId: recordId,
      url: `/services/data/${SALESFORCE_API_VERSION}/sobjects/${sObjectType}/${recordId}?fields=${commaSeparetedFields}`,
    });
  }
  return await fetchRetriable(endPoint, 'POST', JSON.stringify(body));
};

/**
 * @description Create multiple records using composite resource.
 * @param records
 * @see https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/dome_composite_sobject_tree_flat.htm
 */
export const createSalesforceRecords = async (sObjectType: string, records) => {
  const endPoint = (await buildEndpointUrl()) + `/composite/tree/${sObjectType}`;
  const fieldType = await storage.load({ key: ASYNC_STORAGE_KEYS.FIELD_TYPE });
  const body = {
    records: records.map(r => {
      Object.entries(r).forEach(([key, value]) => {
        // Remove null fields
        if (value === null) {
          delete r[key];
          // Replace number value to boolean for checkbox field
        } else if (fieldType[key] === 'boolean') {
          r[key] = value === 1 ? true : false;
        } else if (fieldType[key] === 'date') {
          r[key] = formatISOStringToAPIDate(value as string);
        }
      });
      r.attributes = {
        type: sObjectType,
        referenceId: `${r._localId}`,
      };
      delete r._localId;
      return r;
    }),
  };
  logger('DEBUG', 'createSalesforceRecords', body);
  const response = await fetchRetriable(endPoint, 'POST', JSON.stringify(body));
  return response;
};

/**
 * @description Retrieve record type mappings information
 * @param sObjectType
 * @see https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/resources_sobject_layouts.htm
 */
export const describeLayoutResult = async (sObjectType: string): Promise<DescribeLayoutResult> => {
  const endPoint = (await buildEndpointUrl()) + `/sobjects/${sObjectType}/describe/layouts`;
  logger('DEBUG', 'describeLayoutResult', endPoint);

  const response = await fetchRetriable(endPoint, 'GET', undefined);
  return response;
};

/**
 * @description Retrieve page layout information using composite resource
 */
export const describeLayouts = async (
  sObjectType: string,
  recordTypeIds: Array<string>
): Promise<CompositeLayoutResponse> => {
  const endPoint = (await buildEndpointUrl()) + '/composite';
  const body = {
    allOrNone: true,
    compositeRequest: [],
  };
  for (const recordTypeId of recordTypeIds) {
    body.compositeRequest.push({
      method: 'GET',
      referenceId: recordTypeId,
      url: `/services/data/${SALESFORCE_API_VERSION}/sobjects/${sObjectType}/describe/layouts/${recordTypeId}`,
    });
  }

  const result = await fetchRetriable(endPoint, 'POST', JSON.stringify(body));
  return result;
};

/**
 * @description Retrieve compact layout information using composite resource
 * @param sObjectType
 * @param recordTypeIds
 */
export const describeCompactLayouts = async (sObjectType: string, recordTypeIds: Array<string>) => {
  const endPoint = (await buildEndpointUrl()) + '/composite';
  const body = {
    allOrNone: true,
    compositeRequest: [],
  };
  for (const recordTypeId of recordTypeIds) {
    body.compositeRequest.push({
      method: 'GET',
      referenceId: recordTypeId,
      url: `/services/data/${SALESFORCE_API_VERSION}/sobjects/${sObjectType}/describe/compactLayouts/${recordTypeId}`,
    });
  }

  return await fetchRetriable(endPoint, 'POST', JSON.stringify(body));
};

/**
 * @description Private function to construct base url
 */
const buildEndpointUrl = async () => {
  const instanceUrl = await storage.load({
    key: ASYNC_STORAGE_KEYS.SALESFORCE_INSTANCE_URL,
  });
  return `${instanceUrl}/services/data/${SALESFORCE_API_VERSION}`;
};
