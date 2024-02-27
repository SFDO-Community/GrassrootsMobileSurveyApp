import { buildLayoutDetail } from '../../src/services/layout';
import { getRecords } from '../../src/services/database/database';

jest.mock('../../src/services/database/database', () => ({
  getRecords: jest.fn(),
}));

describe('buildLayoutDetail', () => {
  it('layout', async () => {
    getRecords
      .mockImplementationOnce(() => Promise.resolve(mockSQLiteSectionResponse))
      .mockImplementationOnce(() => Promise.resolve(mockSQLiteItemResponse));

    const layout = await buildLayoutDetail('lid');
    expect(layout.sections).toHaveLength(2);
    expect(layout.sections[0].data).toHaveLength(1);
    expect(layout.sections[1].data).toHaveLength(3);
  });
});

const mockSQLiteSectionResponse = [
  {
    id: 'sid1',
    layoutId: 'lid',
    sectionLabel: 'Test Section 1',
  },
  {
    id: 'sid2',
    layoutId: 'lid',
    sectionLabel: 'Test Section 2',
  },
];

const mockSQLiteItemResponse = [
  {
    sectionId: 'sid1',
    fieldName: 'Field1__c',
    fieldLabel: 'Test Field 1',
    fieldType: 'string',
  },
  {
    sectionId: 'sid2',
    fieldName: 'Field2__c',
    fieldLabel: 'Test Field 2',
    fieldType: 'string',
  },
  {
    sectionId: 'sid2',
    fieldName: 'Field3__c',
    fieldLabel: 'Test Field 3',
    fieldType: 'string',
  },
  {
    sectionId: 'sid2',
    fieldName: 'Field4__c',
    fieldLabel: 'Test Field 4',
    fieldType: 'string',
  },
];
