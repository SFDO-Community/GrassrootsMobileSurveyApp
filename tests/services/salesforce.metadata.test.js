import {
  storeRecordTypesWithCompactLayout,
  storePageLayoutItems,
  storePageLayoutSections,
  getAvailableLanguages,
} from '../../src/services/salesforce/metadata';
import { fetchSalesforceRecords } from '../../src/services/salesforce/core';

// mocks
import { describeCompactLayouts, describeLayoutResult } from '../../src/services/salesforce/core';
import { saveRecords } from '../../src/services/database/database';
import mockCompositeDescribeCompactLayoutsMultiple from './mock/mockCompositeDescribeCompactLayoutsMultiple.json';
import mockDescribeLayoutsResponseMultiple from './mock/mockDescribeLayoutsResponseMultiple.json';
import mockDescribeLayoutSingle from './mock/mockDescribeLayoutSingle.json';
import { DB_TABLE } from '../../src/constants';

jest.mock('../../src/services/salesforce/core', () => ({
  describeLayoutResult: jest.fn(),
  describeCompactLayouts: jest.fn(),
  fetchSalesforceRecords: jest.fn(),
}));

jest.mock('../../src/services/database/database', () => ({
  saveRecords: jest.fn().mockImplementation(() => Promise.resolve()),
}));

describe('storeRecordTypesWithCompactLayout', () => {
  it('positive', async () => {
    describeLayoutResult.mockImplementation(() => Promise.resolve(mockDescribeLayoutsResponseMultiple));
    describeCompactLayouts.mockImplementation(() => Promise.resolve(mockCompositeDescribeCompactLayoutsMultiple));

    const recordTypes = await storeRecordTypesWithCompactLayout();
    expect(recordTypes).toHaveLength(3);
  });
});

describe('storePageLayoutItems', () => {
  it('positive', async () => {
    const { fieldTypesMap, picklistValuesMap } = await storePageLayoutItems(mockDescribeLayoutSingle);
    expect(fieldTypesMap).toBeTruthy();
    expect(picklistValuesMap).toBeTruthy();
  });
});

describe('storePageLayoutSections', () => {
  it('positive', async () => {
    saveRecords.mockClear();
    await storePageLayoutSections(mockDescribeLayoutSingle);
    expect(saveRecords.mock.calls).toHaveLength(1);
    expect(saveRecords.mock.calls[0][0]).toBe(DB_TABLE.PAGE_LAYOUT_SECTION);
    expect(saveRecords.mock.calls[0][2]).toBe('id');
  });
});

describe('getAvailableLanguages', () => {
  it('positive (with English)', async () => {
    fetchSalesforceRecords.mockImplementation(() => Promise.resolve(['en_US', 'fr']));
    const result = await getAvailableLanguages();
    expect(result.length).toBe(2);
    expect(result[0].code).toBe('en_US');
    expect(result[1].code).toBe('fr');
  });

  it('positive (without English)', async () => {
    fetchSalesforceRecords.mockImplementation(() => Promise.resolve(['it', 'ja']));
    const result = await getAvailableLanguages();
    expect(result.length).toBe(2);
    expect(result[0].code).toBe('it');
    expect(result[1].code).toBe('ja');
  });

  it('no custom metadata records', async () => {
    fetchSalesforceRecords.mockImplementation(() => Promise.resolve([]));
    const result = await getAvailableLanguages();
    expect(result.length).toBe(1);
    expect(result[0].code).toBe('en_US');
  });

  it('invalid custom metadata records', async () => {
    fetchSalesforceRecords.mockImplementation(() => Promise.resolve(['aaaaa']));
    const result = await getAvailableLanguages();
    expect(result.length).toBe(1);
    expect(result[0].code).toBe('en_US');
  });
});
