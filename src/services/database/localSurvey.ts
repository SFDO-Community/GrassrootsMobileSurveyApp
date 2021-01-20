import { updateRecord, updateFieldValue, saveRecords } from './database';
import { ASYNC_STORAGE_KEYS, DB_TABLE, USER_CONTACT_FIELD_ON_SURVEY } from '../../constants';
import { logger } from '../../utility/logger';

/**
 * @description Create a new survey in local database
 * @param survey
 */
export const upsertLocalSurvey = async survey => {
  survey[USER_CONTACT_FIELD_ON_SURVEY] = await storage.load({ key: ASYNC_STORAGE_KEYS.USER_CONTACT_ID });
  logger('DEBUG', 'Saving survey', survey);
  if (survey._localId) {
    return await updateRecord(DB_TABLE.SURVEY, survey, `where _localId = ${survey._localId}`);
  }
  return await saveRecords(DB_TABLE.SURVEY, [survey], undefined);
};

/**
 * @updateSurveyStatusSynced
 * @param surveys Offline surveys
 */
export const updateSurveyStatusSynced = async surveys => {
  const commaSeparetedLocalIds = surveys.map(s => s._localId).join(',');
  return await updateFieldValue(
    DB_TABLE.SURVEY,
    '_syncStatus',
    'Synced',
    `where _localId IN (${commaSeparetedLocalIds})`
  );
};
