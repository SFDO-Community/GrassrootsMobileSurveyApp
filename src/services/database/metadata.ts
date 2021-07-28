import { getAllRecords, getRecords } from './database';
import { SQLiteRecordType, SQLitePicklistValue } from '../../types/sqlite';
import { DB_TABLE } from '../../constants';
import { logger } from '../../utility/logger';

/**
 * @description Get all the available record types of the survey object from local database.
 * If there's active record types other than master, they will be returned. Master record type will not be returned.
 * If master is only the active record type, it will be returned.
 */
export const getAllAvailableRecordTypes = async (): Promise<Array<SQLiteRecordType>> => {
  const recordTypes: Array<SQLiteRecordType> = await getAllRecords(DB_TABLE.RECORD_TYPE);
  const result = recordTypes.filter(r => r.active).filter((r, i, array) => (array.length > 1 ? !r.master : true));
  logger('DEBUG', 'getAllAvailableRecordTypes', result);
  return result;
};

/**
 * @description
 * @param fieldName
 */
export const getPicklistValues = async (fieldName: string) => {
  const recordTypes: Array<SQLitePicklistValue> = await getRecords(
    DB_TABLE.PICKLIST_VALUE,
    `where fieldName='${fieldName}'`
  );
  return recordTypes;
};
