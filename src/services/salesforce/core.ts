import { fetchRetriable } from './connection';

import { ASYNC_STORAGE_KEYS } from '../../constants';
import { logger } from '../../utility/logger';
import { DescribeLayoutResult, CompositeLayoutResponse, RecordDefaultsResponse } from '../../../src/types/metadata';
import { formatISOStringToAPIDate } from '../../utility/date';
import { sliceByNumber } from '../../utility';

const SALESFORCE_API_VERSION = 'v49.0';
const MAX_NUM_OF_OPERATION = 25;
/**
 * @description Execute SOQL and return records
 * @param query SOQL
 * @return records
 */
export const fetchSalesforceRecords = async (query: string) => {
  const endPoint = (await buildEndpointUrl()) + `/query?q=${query}`;
  const response = await fetchRetriable({ endPoint, method: 'GET', body: undefined });
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
 * @description Execute SOQL and return records
 * @param query SOQL
 * @return records
 */
export const fetchToolingRecords = async (query: string) => {
  const endPoint = (await buildEndpointUrl()) + `/tooling/query?q=${query}`;
  const response = await fetchRetriable({ endPoint, method: 'GET', body: undefined });
  // Error response of Salesforce REST API is array format.
  const hasError = Array.isArray(response);
  if (hasError) {
    logger('ERROR', 'fetchToolingRecords', response);
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
  commaSeparatedFields: string
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
      url: `/services/data/${SALESFORCE_API_VERSION}/sobjects/${sObjectType}/${recordId}?fields=${commaSeparatedFields}`,
    });
  }
  return await fetchRetriable({ endPoint, method: 'POST', body: JSON.stringify(body) });
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
  const response = await fetchRetriable({ endPoint, method: 'POST', body: JSON.stringify(body) });
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

  const response = await fetchRetriable({ endPoint, method: 'GET', body: undefined });
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
  const recordTypeIdsBundle = sliceByNumber(recordTypeIds, MAX_NUM_OF_OPERATION);
  let result: CompositeLayoutResponse;
  for (const currentRecordTypeIds of recordTypeIdsBundle) {
    const body = {
      allOrNone: true,
      compositeRequest: [],
    };
    for (const recordTypeId of currentRecordTypeIds) {
      body.compositeRequest.push({
        method: 'GET',
        referenceId: recordTypeId,
        url: `/services/data/${SALESFORCE_API_VERSION}/sobjects/${sObjectType}/describe/layouts/${recordTypeId}`,
      });
    }
    const currentResult = await fetchRetriable({ endPoint, method: 'POST', body: JSON.stringify(body) });
    if (!result) {
      result = currentResult;
    } else {
      result.compositeResponse = result.compositeResponse.concat(currentResult.compositeResponse);
    }
  }
  return result;
};

/**
 * @description Retrieve compact layout information using composite resource
 * @param sObjectType
 * @param recordTypeIds
 */
export const describeCompactLayouts = async (sObjectType: string, recordTypeIds: Array<string>) => {
  const endPoint = (await buildEndpointUrl()) + '/composite';
  const recordTypeIdsBundle = sliceByNumber(recordTypeIds, MAX_NUM_OF_OPERATION);
  let result;
  for (const currentRecordTypeIds of recordTypeIdsBundle) {
    const body = {
      allOrNone: true,
      compositeRequest: [],
    };
    for (const recordTypeId of currentRecordTypeIds) {
      body.compositeRequest.push({
        method: 'GET',
        referenceId: recordTypeId,
        url: `/services/data/${SALESFORCE_API_VERSION}/sobjects/${sObjectType}/describe/compactLayouts/${recordTypeId}`,
      });
    }
    const currentResult = await fetchRetriable({ endPoint, method: 'POST', body: JSON.stringify(body) });
    if (!result) {
      result = currentResult;
    } else {
      result.compositeResponse = result.compositeResponse.concat(currentResult.compositeResponse);
    }
  }
  return result;
};

/**
 * @description Get localized record types, page layout sections, and items using User Interface API.
 * https://developer.salesforce.com/docs/atlas.en-us.uiapi.meta/uiapi/ui_api_resources_record_defaults_create.htm
 * @param sObjectType
 * @param recordTypeId
 * @param salesforceLanguageCode
 */
export const getLocalizedObjectInfo = async (
  sObjectType: string,
  recordTypeId: string,
  salesforceLanguageCode: string
): Promise<RecordDefaultsResponse> => {
  const endPoint = (await buildEndpointUrl()) + `/ui-api/record-defaults/create/${sObjectType}`;
  const response = await fetchRetriable({
    endPoint,
    method: 'GET',
    body: undefined,
    headers: { 'Accept-Language': salesforceLanguageCode, recordTypeId },
  });
  return response;
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
