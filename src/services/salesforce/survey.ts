import { createSalesforceRecords, fetchSalesforceRecords } from './core';
import { clearTable, getAllRecords, saveRecords, prepareTable } from '../database/database';
import {
  ASYNC_STORAGE_KEYS,
  BACKGROUND_SURVEY_FIELDS,
  DB_TABLE,
  LOCAL_SURVEY_FIELDS,
  SURVEY_OBJECT,
  USER_CONTACT_FIELD_ON_SURVEY,
} from '../../constants';
import {
  SQLiteFieldTypeMapping,
  SQLitePageLayoutItem,
  SQLiteRawRecordTypeObject,
  SQLiteRecordType,
  SQLiteSurveyTitleObject,
} from '../../types/sqlite';

/**
 * @description Retrieve all the surveys from Salesforce by area code, and store them to local database
 * @todo Use constants
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
  clearTable('Survey');
  prepareTable(DB_TABLE.SURVEY, [...surveyFieldTypeMappings, ...LOCAL_SURVEY_FIELDS], undefined);

  // Query salesforce records and save them to local
  const commaSeparetedFields = Array.from(fieldsMap.values())
    .map(f => f.fieldName)
    .join(',');

  const contactId = await storage.load({ key: ASYNC_STORAGE_KEYS.USER_CONTACT_ID });
  const surveys = await fetchSalesforceRecords(
    `SELECT ${commaSeparetedFields} FROM ${SURVEY_OBJECT} WHERE ${USER_CONTACT_FIELD_ON_SURVEY} = '${contactId}'`
  );
  if (surveys.length === 0) {
    return;
  }
  saveRecords(
    'Survey',
    surveys.map(s => ({ ...s, _syncStatus: 'Synced' })),
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
    // Remove joined record types
    Object.keys({ ...SQLiteRawRecordTypeObject, ...SQLiteSurveyTitleObject }).forEach(key => {
      delete s[key];
    });
    return s;
  });
  return await createSalesforceRecords(SURVEY_OBJECT, records);
};
