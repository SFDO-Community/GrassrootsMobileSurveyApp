import { getCurrentUserContact, storeContacts } from '../../src/services/salesforce/contact';
import { fetchSalesforceRecords } from '../../src/services/salesforce/core';

jest.mock('../../src/services/salesforce/core', () => ({
  fetchSalesforceRecords: jest.fn(),
}));

jest.mock('../../src/services/database/database', () => ({
  clearTable: jest.fn().mockImplementation(() => Promise.resolve()),
  saveRecords: jest.fn().mockImplementation(() => Promise.resolve()),
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
