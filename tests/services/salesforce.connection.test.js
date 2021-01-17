/* eslint-disable @typescript-eslint/camelcase */
import { fetchRetriable } from '../../src/services/salesforce/connection';
import { mockLoginResponse, mockQuerySuccessResponse, mockQueryFailureResponse } from './mockResponse';

jest.mock('../../src/services/auth', () => ({
  authenticate: jest.fn().mockImplementation(() => Promise.resolve(mockLoginResponse)),
}));

describe('fetchRetriable', () => {
  const endPoint = 'https://test.my.salesforce.com/services/data/v50.0/query?q=select+id+from+account';
  const method = 'GET';
  beforeEach(() => {
    global.storage = { load: jest.fn(), save: jest.fn() };
  });

  it('fisrt success', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce(mockQuerySuccessResponse);

    const response = await fetchRetriable(endPoint, method, undefined);
    expect(response.totalSize).toBe(1);
    expect(response.records[0].Id).toBeTruthy();
  });

  it('retry success', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(mockQueryFailureResponse)
      .mockResolvedValueOnce(mockQuerySuccessResponse);

    const response = await fetchRetriable(endPoint, method, undefined);
    expect(response.totalSize).toBe(1);
    expect(response.records[0].Id).toBeTruthy();
  });
});
