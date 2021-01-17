import * as SecureStore from 'expo-secure-store';

import { fetchSalesforceRecords } from './core';
import { clearTable, saveRecords } from '../../database';
import { logger } from '../../../utility/logger';
import { DB_TABLE, ASYNC_STORAGE_KEYS } from '../../../constants';
import { SQLiteContact } from '../../../types/sqlite';

/**
 * @description Fetch contact record by logged in email. Throw an errow when record is not found or multiple records are found.
 * @return the contact record object
 */
export const getCurrentUserContact = async () => {
  const appUserEmail = await SecureStore.getItemAsync('email');
  const query = `SELECT Id, Name FROM Contact WHERE GRSM_LoginEmail__c = '${appUserEmail}' AND RecordType.DeveloperName = 'GRSM_User'`;
  try {
    const records = await fetchSalesforceRecords(query);
    logger('DEBUG', 'getCurrentUserContact', records);
    if (records.length !== 1) {
      return Promise.reject({
        message: 'User contact record is not found or duplicated. Check your Salesforce org.',
      });
    }
    return records[0];
  } catch {
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
  const junctionQuery = `SELECT Id, Client__c, Client__r.Name, Type__c
    FROM GRSM_UserClientRelation__c 
    WHERE User__c = '${userContactId}'`;
  try {
    const junctionRecords = await fetchSalesforceRecords(junctionQuery);
    const contacts: Array<SQLiteContact> = junctionRecords.map(junctionRecord => ({
      id: junctionRecord.Client__c,
      name: junctionRecord.Client__r.Name,
      type: junctionRecord.Type__c,
      userId: userContactId,
    }));
    // TODO: id duplicates
    logger('DEBUG', 'storeContacts', contacts);
    await clearTable(DB_TABLE.CONTACT);
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
