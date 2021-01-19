import { createSalesforceRecords, fetchSalesforceRecords } from './salesforce/core';
import {
  updateRecord,
  updateFieldValue,
  clearTable,
  getAllRecords,
  saveRecords,
  prepareTable,
} from './database/database';
import { ASYNC_STORAGE_KEYS, DB_TABLE, SURVEY_OBJECT, USER_CONTACT_FIELD_ON_SURVEY } from '../constants';
import { SQLiteFieldTypeMapping, SQLitePageLayoutItem } from '../types/sqlite';
import { logger } from '../utility/logger';

/**
 * @description Retrieve all the surveys from Salesforce by area code, and store them to local database
 * @todo Use constants
 */
export const storeOnlineSurveys = async () => {
  // Build field list from page layout items
  const fields: Array<SQLitePageLayoutItem> = await getAllRecords(DB_TABLE.PAGE_LAYOUT_ITEM);
  // Prepare local survey table
  const serializedFieldSet = new Set(
    fields.map(f =>
      JSON.stringify({
        fieldName: f.fieldName,
        fieldType: f.fieldType,
      })
    )
  );
  serializedFieldSet.add(
    JSON.stringify({
      fieldName: 'RecordTypeId',
      fieldType: 'reference',
    })
  );
  serializedFieldSet.add(
    JSON.stringify({
      fieldName: 'Name',
      fieldType: 'string',
    })
  );
  serializedFieldSet.add(
    JSON.stringify({
      fieldName: USER_CONTACT_FIELD_ON_SURVEY,
      fieldType: 'reference',
    })
  );
  const surveyFieldTypeMappings: Array<SQLiteFieldTypeMapping> = [...serializedFieldSet.values()].map(s => {
    const item = JSON.parse(s);
    const result: SQLiteFieldTypeMapping = {
      name: item.fieldName,
      type: ['double', 'boolean', 'percent', 'currency'].includes(item.fieldType) ? 'integer' : 'text',
    };
    return result;
  });
  const localFields: Array<SQLiteFieldTypeMapping> = [
    {
      name: 'syncStatus',
      type: 'text',
    },
  ];
  clearTable('Survey');
  prepareTable(DB_TABLE.SURVEY, [...surveyFieldTypeMappings, ...localFields], undefined);

  // Query salesforce records and save them to local
  const fieldSet = new Set(fields.map(f => f.fieldName));
  fieldSet.add('Name');
  fieldSet.add('RecordTypeId');
  const commaSeparetedFields = Array.from(fieldSet).join(',');

  const contactId = await storage.load({ key: ASYNC_STORAGE_KEYS.USER_CONTACT_ID });
  const surveys = await fetchSalesforceRecords(
    `SELECT ${commaSeparetedFields} FROM ${SURVEY_OBJECT} WHERE ${USER_CONTACT_FIELD_ON_SURVEY} = '${contactId}'`
  );
  if (surveys.length === 0) {
    return;
  }
  saveRecords(
    'Survey',
    surveys.map(s => ({ ...s, syncStatus: 'Synced' })),
    undefined
  );
};

/**
 * @description Create a new survey in local database
 * @param survey
 */
export const upsertLocalSurvey = async survey => {
  survey[USER_CONTACT_FIELD_ON_SURVEY] = await storage.load({ key: ASYNC_STORAGE_KEYS.USER_CONTACT_ID });
  logger('DEBUG', 'Saving survey', survey);
  if (survey.localId) {
    return await updateRecord(DB_TABLE.SURVEY, survey, `where localId = ${survey.localId}`);
  }
  return await saveRecords(DB_TABLE.SURVEY, [survey], undefined);
};

/**
 * @description Upload surveys to salesforce
 * @param surveys
 */
export const uploadSurveyListToSalesforce = async surveys => {
  // create deep clone of array because the original array including localId is used for updating syncStatus.
  const records = surveys.map(survey => {
    const s = Object.assign({}, survey);
    // Remove local or read only fields
    delete s.localId;
    delete s.syncStatus;
    delete s.Name;
    return s;
  });
  return await createSalesforceRecords(SURVEY_OBJECT, records);
};

/**
 * @updateSurveyStatusSynced
 * @param surveys Offline surveys
 */
export const updateSurveyStatusSynced = async surveys => {
  const commaSeparetedLocalIds = surveys.map(s => s.localId).join(',');
  return await updateFieldValue(
    DB_TABLE.SURVEY,
    'syncStatus',
    'Synced',
    `where localId IN (${commaSeparetedLocalIds})`
  );
};
