import { fetchSalesforceRecords } from '../../src/services/salesforce/core';
import { mockResolvedQueryResult } from './mockResponse';

jest.mock('../../src/services/salesforce/connection', () => ({
  fetchRetriable: jest.fn().mockImplementation(() => Promise.resolve(mockResolvedQueryResult)),
}));

describe('fetchSalesforceRecords', () => {
  beforeEach(() => {
    global.storage = { load: jest.fn(), save: jest.fn() };
  });

  it('records', async () => {
    const records = await fetchSalesforceRecords('select id from account');
    expect(records.length).toBe(1);
    expect(records[0].Id).toBeTruthy();
  });
});
