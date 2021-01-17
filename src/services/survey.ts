import { createSalesforceRecords, fetchSalesforceRecords } from './api/salesforce/core';
import { updateRecord, updateFieldValue, clearTable, getAllRecords, saveRecords, prepareTable } from './database';
import { ASYNC_STORAGE_KEYS, DB_TABLE } from '../constants';
import { FieldTypeMapping, PageLayoutItem } from '../types/sqlite';
import { logger } from '../utility/logger';

/**
 * @description Retrieve all the surveys from Salesforce by area code, and store them to local database
 * @todo Use constants
 */
export const storeOnlineSurveys = async () => {
  // Build field list from page layout items
  const fields: Array<PageLayoutItem> = await getAllRecords(DB_TABLE.PageLayoutItem);
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
      fieldType: 'text',
    })
  );
  serializedFieldSet.add(
    JSON.stringify({
      fieldName: 'Name',
      fieldType: 'text',
    })
  );
  const surveyFieldTypeMappings: Array<FieldTypeMapping> = [...serializedFieldSet.values()].map(s => {
    const item = JSON.parse(s);
    const result: FieldTypeMapping = {
      name: item.fieldName,
      type: ['double', 'boolean', 'percent', 'currency'].includes(item.fieldType) ? 'integer' : 'text',
    };
    return result;
  });
  const localFields: Array<FieldTypeMapping> = [
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

  const areaCode = await storage.load({
    key: ASYNC_STORAGE_KEYS.AREA_CODE,
  });
  const surveys = await fetchSalesforceRecords(
    `SELECT ${commaSeparetedFields} FROM Survey__c WHERE Area_Code__c = '${areaCode}'`
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
  return await createSalesforceRecords('Survey__c', records);
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
