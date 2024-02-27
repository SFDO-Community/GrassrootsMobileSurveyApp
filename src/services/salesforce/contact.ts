import * as SecureStore from 'expo-secure-store';

import { fetchSalesforceRecords } from './core';
import { clearTable, prepareTable, saveRecords } from '../database/database';
import { DB_TABLE, ASYNC_STORAGE_KEYS, SECURE_STORE_KEYS, CONTACT_ERROR } from '../../constants';

import { logger } from '../../utility/logger';
import { SQLiteContact, SQLiteFieldTypeMapping } from '../../types/sqlite';

/**
 * @description Fetch contact record by logged in email. Throw an errow when record is not found or multiple records are found.
 * @return the contact record object
 */
export const getCurrentFieldWorker = async () => {
  const appUserEmail = await SecureStore.getItemAsync(SECURE_STORE_KEYS.EMAIL);
  const query = `SELECT Id, Name FROM Contact WHERE GRMS__LoginEmail__c = '${appUserEmail}' AND GRMS__ContactType__c = 'Field Worker'`;
  try {
    const records = await fetchSalesforceRecords(query);
    logger('DEBUG', 'getCurrentFieldWorker', records);
    if (records.length !== 1) {
      return Promise.reject({
        message: CONTACT_ERROR.INVALID_FIELD_WORKER_RECORD,
      });
    }
    return records[0];
  } catch (e) {
    logger('ERROR', 'getCurrentFieldWorker', e);
    throw new Error(CONTACT_ERROR.UNEXPECTED);
  }
};

/**
 * @description Fetch contacts, resolve relationships and then save them to local database.
 */
export const storeContacts = async () => {
  const fieldWorkerContactId = await storage.load({
    key: ASYNC_STORAGE_KEYS.FIELD_WORKER_CONTACT_ID,
  });
  const junctionQuery = `SELECT Id, GRMS__Client__c, GRMS__Client__r.Name, GRMS__Type__c
    FROM GRMS__FieldWorkerClientRelation__c 
    WHERE GRMS__FieldWorker__c = '${fieldWorkerContactId}'`;
  try {
    const junctionRecords = await fetchSalesforceRecords(junctionQuery);
    const contactMap: Map<string, SQLiteContact> = new Map<string, SQLiteContact>(
      junctionRecords.map(junctionRecord => [
        junctionRecord.GRMS__Client__c,
        {
          id: junctionRecord.GRMS__Client__c,
          name: junctionRecord.GRMS__Client__r.Name,
          type: junctionRecord.GRMS__Type__c,
        },
      ])
    );
    // Prepare contact table
    const fieldTypeMappings: Array<SQLiteFieldTypeMapping> = [
      { name: 'id', type: 'text' },
      { name: 'name', type: 'text' },
      { name: 'type', type: 'text' },
    ];
    clearTable(DB_TABLE.CONTACT);
    prepareTable(DB_TABLE.CONTACT, fieldTypeMappings, 'id');
    const contacts = Array.from(contactMap.values());
    logger('DEBUG', 'storeContacts', contacts);
    await saveRecords(DB_TABLE.CONTACT, contacts, 'id');
    return contacts;
  } catch (error) {
    if (error.origin === 'query') {
      throw new Error(CONTACT_ERROR.JUNCTION_QUERY);
    }
    throw new Error(CONTACT_ERROR.JUNCTION_UNEXPECTED);
  }
};
