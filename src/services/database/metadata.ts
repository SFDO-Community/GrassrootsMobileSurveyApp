import { getAllRecords, getRecords } from './database';
import { SQLiteRecordType, SQLitePicklistValue } from '../../types/sqlite';
import { DB_TABLE } from '../../constants';

/**
 * @description Get all the record types of the survey object from local database
 */
export const getAllRecordTypes = async (): Promise<Array<SQLiteRecordType>> => {
  const recordTypes: Array<SQLiteRecordType> = await getAllRecords(DB_TABLE.RECORD_TYPE);
  return recordTypes;
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
