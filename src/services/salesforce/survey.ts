import { createSalesforceRecords, fetchSalesforceRecords, fetchSalesforceRecordsByIds } from './core';
import { clearTable, getAllRecords, saveRecords, prepareTable } from '../database/database';
import {
  ASYNC_STORAGE_KEYS,
  BACKGROUND_SURVEY_FIELDS,
  DB_TABLE,
  LOCAL_SURVEY_FIELDS,
  SURVEY_OBJECT,
  SYNC_STATUS_SYNCED,
  FIELD_WORKER_CONTACT_FIELD_ON_SURVEY,
  RECORD_TYPE_ID_FIELD,
} from '../../constants';
import {
  SQLiteFieldTypeMapping,
  SQLitePageLayoutItem,
  SQLiteRawRecordTypeObject,
  SQLiteRecordType,
  SQLiteSurveyTitleObject,
} from '../../types/sqlite';
import { logger } from '../../utility/logger';
import {
  CompositeGenericErrorResponse,
  CompositeObjectResponse,
  implementsCompositeGenericErrorResponse,
} from '../../types/survey';

/**
 * @description Retrieve all the surveys from Salesforce by area code, and store them to local database
 * @todo field types
 */
export const storeOnlineSurveys = async () => {
  // Build field list from page layout items
  const fields: Array<SQLitePageLayoutItem> = await getAllRecords(DB_TABLE.PAGE_LAYOUT_ITEM);
  // Titles fields related to record types
  const recordTypes: Array<SQLiteRecordType> = await getAllRecords(DB_TABLE.RECORD_TYPE);
  const titleFields = recordTypes
    .filter(rt => rt.titleFieldName)
    .map(rt => ({
      fieldName: rt.titleFieldName,
      fieldType: rt.titleFieldType,
    }));
  // Prepare local survey table
  const fieldsMap = new Map(
    [...fields, ...titleFields, ...BACKGROUND_SURVEY_FIELDS].map(f => [
      f.fieldName,
      { fieldName: f.fieldName, fieldType: f.fieldType },
    ])
  );

  const surveyFieldTypeMappings: Array<SQLiteFieldTypeMapping> = Array.from(fieldsMap.values()).map(item => {
    const result: SQLiteFieldTypeMapping = {
      name: item.fieldName,
      type: ['double', 'boolean', 'percent', 'currency'].includes(item.fieldType) ? 'integer' : 'text',
    };
    return result;
  });
  clearTable(DB_TABLE.SURVEY);
  prepareTable(DB_TABLE.SURVEY, [...surveyFieldTypeMappings, ...LOCAL_SURVEY_FIELDS], undefined);
  // Remove RecordTypeId field for query if master record type only
  if (hasMasterRecordTypeOnly(recordTypes)) {
    fieldsMap.delete(RECORD_TYPE_ID_FIELD);
  }
  // Query salesforce records and save them to local
  const commaSeparatedFields = Array.from(fieldsMap.values())
    .map(f => f.fieldName)
    .join(',');

  const contactId = await storage.load({ key: ASYNC_STORAGE_KEYS.FIELD_WORKER_CONTACT_ID });
  const surveys = await fetchSalesforceRecords(
    `SELECT ${commaSeparatedFields} FROM ${SURVEY_OBJECT} WHERE ${FIELD_WORKER_CONTACT_FIELD_ON_SURVEY} = '${contactId}'`
  );
  if (surveys.length === 0) {
    return;
  }
  const localSurveys = surveys.map(s => ({ ...s, _syncStatus: SYNC_STATUS_SYNCED }));
  const masterRecordTypeId = recordTypes.find(r => r.master).recordTypeId;
  await saveRecords(
    DB_TABLE.SURVEY,
    // Set master record type id if the record type id field is null.
    localSurveys.map(s => (s[RECORD_TYPE_ID_FIELD] ? s : { ...s, [RECORD_TYPE_ID_FIELD]: masterRecordTypeId })),
    undefined
  );
};

/**
 * @description Upload surveys to salesforce
 * @param surveys
 */
export const uploadSurveyListToSalesforce = async surveys => {
  const recordTypes: Array<SQLiteRecordType> = await getAllRecords(DB_TABLE.RECORD_TYPE);
  const readonlyTitleFields = recordTypes
    .filter(rt => rt.titleFieldName && !rt.titleFieldUpdateable)
    .map(rt => rt.titleFieldName);
  // create deep clone of array because the original array including _localId is used for updating _syncStatus.
  const records = surveys.map(survey => {
    const s = Object.assign({}, survey);
    // Remove local or read only fields (except for _localId)
    Object.values(LOCAL_SURVEY_FIELDS).forEach(v => {
      delete s[v.name];
    });
    // Remove read-only title fields
    for (const titleField of readonlyTitleFields) {
      delete s[titleField];
    }
    // Remove RecordTypeId if master record type only
    if (hasMasterRecordTypeOnly(recordTypes)) {
      delete s[RECORD_TYPE_ID_FIELD];
    }
    // Remove joined record types
    Object.keys({ ...SQLiteRawRecordTypeObject, ...SQLiteSurveyTitleObject }).forEach(key => {
      delete s[key];
    });
    return s;
  });
  return await createSalesforceRecords(SURVEY_OBJECT, records);
};

/**
 * @description fetch survey fields using composite resource
 * @param surveyIds
 */
export const fetchSurveysWithTitleFields = async (surveyIds: Array<string>): Promise<Map<string, object>> => {
  // retrieve title fields
  const recordTypes: Array<SQLiteRecordType> = await getAllRecords(DB_TABLE.RECORD_TYPE);
  const titleFieldSet: Set<string> = new Set(recordTypes.filter(rt => rt.titleFieldName).map(rt => rt.titleFieldName));
  if (titleFieldSet.size === 0) {
    return new Map(surveyIds.map(surveyId => [surveyId, {}]));
  }
  const commaSeparatedFields = Array.from(titleFieldSet).join(',');
  const compositeResult: CompositeObjectResponse | CompositeGenericErrorResponse = await fetchSalesforceRecordsByIds(
    SURVEY_OBJECT,
    surveyIds,
    commaSeparatedFields
  );
  logger('DEBUG', 'fetchSurveysWithTitleFields', compositeResult);
  if (implementsCompositeGenericErrorResponse(compositeResult)) {
    const errorResponse = compositeResult.compositeResponse.find(r => r.httpStatusCode !== 200);
    logger('ERROR', 'fetchSurveysWithTitleFields', errorResponse.body[0].message);
    return Promise.reject({ origin: 'composite', message: errorResponse.body[0].message });
  }
  return new Map(
    compositeResult.compositeResponse.map(cr => {
      const surveyId = cr.body.Id;
      const survey = { ...cr.body };
      delete survey.attributes;
      delete survey.Id;
      return [surveyId, survey];
    })
  );
};

/**
 * @private
 */
const hasMasterRecordTypeOnly = (recordTypes: Array<SQLiteRecordType>): boolean => {
  const activeRecordTypes = recordTypes.filter(r => r.active);
  return activeRecordTypes.length === 1 && activeRecordTypes[0].master;
};
