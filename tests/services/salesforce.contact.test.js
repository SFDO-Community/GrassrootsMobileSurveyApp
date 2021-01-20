/* eslint-disable @typescript-eslint/camelcase */
import { getCurrentUserContact, storeContacts } from '../../src/services/salesforce/contact';
import { fetchSalesforceRecords } from '../../src/services/salesforce/core';

jest.mock('../../src/services/salesforce/core', () => ({
  fetchSalesforceRecords: jest.fn(),
}));

jest.mock('../../src/services/database/database', () => ({
  clearTable: jest.fn().mockImplementation(() => Promise.resolve()),
  saveRecords: jest.fn().mockImplementation(() => Promise.resolve()),
  prepareTable: jest.fn().mockImplementation(() => Promise.resolve()),
}));

describe('getCurrentUserContact', () => {
  beforeEach(() => {
    global.storage = { load: jest.fn(), save: jest.fn() };
  });

  it('positive', async () => {
    fetchSalesforceRecords.mockImplementation(() => Promise.resolve(mockFetchedCurrentContact));

    const result = await getCurrentUserContact();
    expect(result.Name).toEqual('Test');
  });

  it('zero result', async () => {
    fetchSalesforceRecords.mockImplementation(() => Promise.resolve([]));

    try {
      await getCurrentUserContact();
    } catch (e) {
      expect(e.message).toMatch('not found or duplicated');
    }
  });

  it('multiple result', async () => {
    fetchSalesforceRecords.mockImplementation(() => Promise.resolve(mockFetchedMultipleContacts));

    try {
      await getCurrentUserContact();
    } catch (e) {
      expect(e.message).toMatch('not found or duplicated');
    }
  });

  it('query error', async () => {
    fetchSalesforceRecords.mockImplementation(() => Promise.reject());

    try {
      await getCurrentUserContact();
    } catch (e) {
      expect(e.message).toMatch('Unexpected');
    }
  });
});

describe('storeContacts', () => {
  beforeEach(() => {
    global.storage = { load: jest.fn(), save: jest.fn() };
  });

  it('zero result', async () => {
    fetchSalesforceRecords.mockImplementation(() => Promise.resolve([]));

    await storeContacts();
  });

  it('multiple result', async () => {
    fetchSalesforceRecords.mockImplementation(() => Promise.resolve(mockFetchedJunctionRecords));

    const clients = await storeContacts();
    expect(clients).toHaveLength(2);
  });
  it('duplicated result', async () => {
    fetchSalesforceRecords.mockImplementation(() => Promise.resolve(mockFetchedDuplicatedJunctionRecords));

    const clients = await storeContacts();
    expect(clients).toHaveLength(1);
  });
});

const mockFetchedCurrentContact = [
  {
    Id: '0010k00000vJjNzAAK',
    Name: 'Test',
  },
];

const mockFetchedMultipleContacts = [
  {
    Id: '0010k00000vJjNzAAK',
    Name: 'Test',
  },
  {
    Id: '0010k00000vJjNzAAJ',
    Name: 'Test',
  },
];

mockFetchedJunctionRecords = [
  {
    Id: 'a015h0000086YjEAAU',
    GRMS_Client__c: '0035h000001jAKPAA2',
    GRMS_Client__r: {
      attributes: {
        type: 'Contact',
        url: '/services/data/v50.0/sobjects/Contact/0035h000001jAKPAA2',
      },
      Name: 'Mary Jones',
    },
    GRMS_Type__c: null,
  },
  {
    Id: 'a015h0000086Yj9AAE',
    GRMS_Client__c: '0035h000001jAKPAA3',
    GRMS_Client__r: {
      attributes: {
        type: 'Contact',
        url: '/services/data/v50.0/sobjects/Contact/0035h000001jAKPAA3',
      },
      Name: 'Kary Grant',
    },
    GRMS_Type__c: null,
  },
];

mockFetchedDuplicatedJunctionRecords = [
  {
    Id: 'a015h0000086YjEAAU',
    GRMS_Client__c: '0035h000001jAKPAA2',
    GRMS_Client__r: {
      attributes: {
        type: 'Contact',
        url: '/services/data/v50.0/sobjects/Contact/0035h000001jAKPAA2',
      },
      Name: 'Mary Jones',
    },
    GRMS_Type__c: null,
  },
  {
    Id: 'a015h0000086Yj9AAE',
    GRMS_Client__c: '0035h000001jAKPAA2',
    GRMS_Client__r: {
      attributes: {
        type: 'Contact',
        url: '/services/data/v50.0/sobjects/Contact/0035h000001jAKPAA2',
      },
      Name: 'Mary Jones',
    },
    GRMS_Type__c: null,
  },
];
