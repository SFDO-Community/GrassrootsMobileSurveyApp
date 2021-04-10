/* eslint-disable @typescript-eslint/camelcase */
import { getRecords, getAllRecords } from '../../src/services/database/database';
import { getAllRecordTypes, getPicklistValues } from '../../src/services/database/metadata';

jest.mock('expo-sqlite', () => ({ default: {} }));
jest.mock('../../src/services/database/database', () => ({
  getAllRecords: jest.fn(),
  getRecords: jest.fn(),
}));

describe('getAllRecordTypes', () => {
  it('recordtypes', async () => {
    getAllRecords.mockImplementation(() =>
      Promise.resolve([
        {
          recordTypeId: '0125h000000kNJMAA1',
          developerName: 'Test_1',
          label: 'Test 1',
          layoutId: '00h5h000000mTxOAAU',
        },
        {
          recordTypeId: '0125h000000kNJMAA2',
          developerName: 'Test_2',
          label: 'Test 2',
          layoutId: '00h5h000000mTxOAAU',
        },
      ])
    );

    const recordTypes = await getAllRecordTypes();
    expect(recordTypes.length).toBe(2);
  });
});

describe('getPicklistValues', () => {
  it('picklist values', async () => {
    getRecords.mockImplementation(() =>
      Promise.resolve([
        {
          fieldName: 'Test',
          label: 'Hello',
          value: 'Hello',
        },
        {
          fieldName: 'Test',
          label: 'Bonjour',
          value: 'Bonjour',
        },
      ])
    );

    const values = await getPicklistValues('Test');
    expect(values.length).toBe(2);
  });
});
