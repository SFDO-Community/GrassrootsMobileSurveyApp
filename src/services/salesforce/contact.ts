import * as SecureStore from 'expo-secure-store';

import { fetchSalesforceRecords } from './core';
import { clearTable, prepareTable, saveRecords } from '../database/database';
import { DB_TABLE, ASYNC_STORAGE_KEYS, SECURE_STORE_KEYS } from '../../constants';

import { logger } from '../../utility/logger';
import { SQLiteContact, SQLiteFieldTypeMapping } from '../../types/sqlite';

/**
 * @description Fetch contact record by logged in email. Throw an errow when record is not found or multiple records are found.
 * @return the contact record object
 */
export const getCurrentUserContact = async () => {
  const appUserEmail = await SecureStore.getItemAsync(SECURE_STORE_KEYS.EMAIL);
  const query = `SELECT Id, Name FROM Contact WHERE GRMS_LoginEmail__c = '${appUserEmail}' AND GRMS_ContactType__c = 'Survey User'`;
  try {
    const records = await fetchSalesforceRecords(query);
    logger('DEBUG', 'getCurrentUserContact', records);
    if (records.length !== 1) {
      return Promise.reject({
        message: 'User contact record is not found or duplicated. Check your Salesforce org.',
      });
    }
    return records[0];
  } catch (e) {
    logger('ERROR', 'getCurrentUserContact', e);
    throw new Error('Unexpected error occurred while retrieving your contact record. Contact your administrator.');
  }
};

/**
 * @description Fetch contacts, resolve relationships and then save them to local database.
 */
export const storeContacts = async () => {
  const userContactId = await storage.load({
    key: ASYNC_STORAGE_KEYS.USER_CONTACT_ID,
  });
  const junctionQuery = `SELECT Id, GRMS_Client__c, GRMS_Client__r.Name, GRMS_Type__c
    FROM GRMS_UserClientRelation__c 
    WHERE GRMS_User__c = '${userContactId}'`;
  try {
    const junctionRecords = await fetchSalesforceRecords(junctionQuery);
    const contactMap: Map<string, SQLiteContact> = new Map<string, SQLiteContact>(
      junctionRecords.map(junctionRecord => [
        junctionRecord.GRMS_Client__c,
        {
          id: junctionRecord.GRMS_Client__c,
          name: junctionRecord.GRMS_Client__r.Name,
          type: junctionRecord.GRMS_Type__c,
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
    storage.save({
      key: '@Contacts',
      data: contacts,
    });
    return contacts;
  } catch (error) {
    if (error.origin === 'query') {
      throw new Error(
        'Unexpected error occurred while retrieving user-client relationship records. Contact your administrator.'
      );
    }
    throw new Error(
      'Unexpected error occurred while saving user-client relationship records. Contact your administrator.'
    );
  }
};
