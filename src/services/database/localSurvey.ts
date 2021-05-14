import { updateRecord, updateFieldValues, saveRecords, getRecordsWithCallback } from './database';
import {
  ASYNC_STORAGE_KEYS,
  DB_TABLE,
  SURVEY_DATE_FIELD,
  SYNC_STATUS_SYNCED,
  USER_CONTACT_FIELD_ON_SURVEY,
} from '../../constants';
import { logger } from '../../utility/logger';

/**
 * @description Get local surveys with record type
 * @param onSuccess callback
 */
export const getLocalSurveysForList = async onSuccess => {
  const statement = `SELECT * FROM Survey LEFT JOIN RecordType ON Survey.RecordTypeId = RecordType.recordTypeId ORDER BY ${SURVEY_DATE_FIELD} DESC`;
  return await getRecordsWithCallback(statement, onSuccess);
};

/**
 * @description Create a new survey in local database
 * @param survey
 */
export const upsertLocalSurvey = async survey => {
  survey[USER_CONTACT_FIELD_ON_SURVEY] = await storage.load({ key: ASYNC_STORAGE_KEYS.USER_CONTACT_ID });
  survey[SURVEY_DATE_FIELD] = new Date().toISOString();
  logger('DEBUG', 'Saving survey', survey);
  if (survey._localId) {
    return await updateRecord(DB_TABLE.SURVEY, survey, `where _localId = ${survey._localId}`);
  }
  return await saveRecords(DB_TABLE.SURVEY, [survey], undefined);
};

/**
 * @description update status of surveys to synced
 * @param surveys Offline surveys
 */
export const updateSurveyStatusSynced = async surveys => {
  for (const survey of surveys) {
    const surveyFieldValues = [
      { field: '_syncStatus', value: SYNC_STATUS_SYNCED },
      ...Object.entries(survey)
        .filter(kv => kv[0] !== '_localId')
        .map(([field, value]) => ({ field, value })),
    ];
    await updateFieldValues(DB_TABLE.SURVEY, surveyFieldValues, `where _localId = '${survey._localId}'`);
  }
};
