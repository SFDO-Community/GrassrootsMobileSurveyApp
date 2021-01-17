import { fetchSalesforceRecords } from './core';
import { ASYNC_STORAGE_KEYS } from '../../../constants';
import { clearTable, getRecords, saveRecords } from '../../database';
import { logger } from '../../../utility/logger';
import { DB_TABLE } from '../../../constants';
import { Contact } from '../../../types/sqlite';

/**
 * @description Fetch contacts, resolve relationships and then save them to local database.
 * @param appUserId contact Id of community development worker
 */
export const storeContacts = async () => {
  await clearTable(DB_TABLE.CONTACT);
  const appUserId = await getLoggedInCDWContact();
  const junctionQuery = `SELECT Id, Child__c, Child__r.Name, Mother__c, Mother__r.Name, Mother__r.Ante_Natal_Mother__c, Beneficiary_Name__c, Beneficiary_Name__r.Name
    FROM CDW_Client_Junction__c
    WHERE Community_Development_Worker__c = '${appUserId}'`;
  const junctionRecords = await fetchSalesforceRecords(junctionQuery);
  const contacts: Array<Contact> = junctionRecords
    .map(junctionRecord => {
      if (junctionRecord.Child__c) {
        return {
          id: junctionRecord.Child__c,
          name: junctionRecord.Child__r.Name,
          type: 'Child',
          motherId: junctionRecord.Mother__c || '',
          userId: appUserId,
        };
      } else if (junctionRecord.Mother__c && !junctionRecord.Mother__r.Ante_Natal_Mother__c) {
        return {
          id: junctionRecord.Mother__c,
          name: junctionRecord.Mother__r.Name,
          type: 'Mother',
          motherId: '',
          userId: appUserId,
        };
      } else if (junctionRecord.Mother__c && junctionRecord.Mother__r.Ante_Natal_Mother__c) {
        return {
          id: junctionRecord.Mother__c,
          name: junctionRecord.Mother__r.Name,
          type: 'AnteNatelMother',
          motherId: '',
          userId: appUserId,
        };
      } else if (junctionRecord.Beneficiary__c) {
        return {
          id: junctionRecord.Beneficiary_Name__c,
          name: junctionRecord.Beneficiary_Name__r.Name,
          type: 'Beneficiary',
          motherId: '',
          userId: appUserId,
        };
      }
      return undefined;
    })
    .filter(r => r !== undefined);

  logger('DEBUG', 'storeContacts', contacts);
  await saveRecords(DB_TABLE.CONTACT, contacts, 'id');
  storage.save({
    key: '@Contacts',
    data: contacts,
  });
};

/**
 * @description Get contacts by type
 * @param type Contact type (Mother, Child, Beneficiary, AnteNatalMother)
 */
export const getContactByType = async (type: string) => {
  return await getRecords(DB_TABLE.CONTACT, `where type='${type}'`);
};

/**
 * @description Fetch contact by area code.
 * @param areaCode area code entered in area code screen
 */
export const getCDWContact = async areaCode => {
  const query = `SELECT Id, Name, Service_Role__c FROM contact WHERE Area_Code__c='${areaCode}' AND Service_Role__c = 'Health Worker'`;
  const records = await fetchSalesforceRecords(query);
  logger('DEBUG', 'Contact API', `${JSON.stringify(records)}`);
  return records;
};

const getLoggedInCDWContact = async () => {
  return await storage.load({
    key: ASYNC_STORAGE_KEYS.CDW_WORKED_ID,
  });
};
