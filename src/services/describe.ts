import {
  storeRecordTypes,
  storePageLayoutItems,
  storePageLayoutSections,
  storeLocalization,
} from './salesforce/metadata';
import { saveRecords, getRecords, clearTable } from './database/database';
import { SQLitePageLayoutSection, SQLitePageLayoutItem } from '../types/sqlite';
import { SurveyLayout } from '../types/survey';
import { CompositeLayoutResponse, DescribeLayout } from '../types/metadata';

import { logger } from '../utility/logger';
import { ASYNC_STORAGE_KEYS, DB_TABLE, SURVEY_OBJECT } from '../constants';
import { describeLayouts } from './salesforce/core';

/**
 * @description Download record types, all the page layouts, and localization custom metadata.
 */
export const retrieveAllMetadata = async () => {
  try {
    // Record types
    await clearTable(DB_TABLE.RECORD_TYPE);
    const recordTypes = await storeRecordTypes();
    // Page Layout
    await clearTable(DB_TABLE.PAGE_LAYOUT_SECTION);
    await clearTable(DB_TABLE.PAGE_LAYOUT_ITEM);
    const serializedPicklistValueSet = new Set();
    const serializedFieldTypeSet = new Set();
    const compositeLayoutResult: CompositeLayoutResponse = await describeLayouts(
      SURVEY_OBJECT,
      recordTypes.map(r => r.recordTypeId)
    );
    const layouts: Array<DescribeLayout> = Array.from(
      new Map(compositeLayoutResult.compositeResponse.map(r => [r.body.id, r.body])).values()
    );

    for (const layout of layouts) {
      await storePageLayoutSections(layout);
      const pageLayoutResult = await storePageLayoutItems(layout);
      const currentSerializedPicklistValueSet = pageLayoutResult.serializedPicklistValueSet;
      const currentSerializedFieldTypeSet = pageLayoutResult.serializedFieldTypeSet;
      currentSerializedPicklistValueSet.forEach(serializedPicklistValueSet.add, serializedPicklistValueSet);
      currentSerializedFieldTypeSet.forEach(serializedFieldTypeSet.add, serializedFieldTypeSet);
    }
    // Picklist options
    await clearTable(DB_TABLE.PICKLIST_VALUE);
    const picklistValues = [...serializedPicklistValueSet.values()].map(s => {
      return JSON.parse(s as string);
    });
    await saveRecords(DB_TABLE.PICKLIST_VALUE, picklistValues, undefined);

    // Field type object
    const fieldType = [...serializedFieldTypeSet.values()]
      .map(s => {
        return JSON.parse(s as string);
      })
      .reduce((result, current) => {
        result[current.name] = current.type;
        return result;
      }, {});
    storage.save({ key: ASYNC_STORAGE_KEYS.FIELD_TYPE, data: fieldType });
    // Localization
    await clearTable(DB_TABLE.LOCALIZATION);
    await storeLocalization();
  } catch (e) {
    logger('ERROR', 'retrieveAllMetadata', e);
    if (e.error === 'no_record_types') {
      throw new Error('No record types on Survey object. Contact your administrator.');
    } else if (e.error === 'no_editable_fields') {
      throw new Error('No editable fields on Survey layout. Contact your administrator.');
    }
    throw new Error('Unexpected error occured while retrieving survey settings. Contact your administrator.');
  }
};

/**
 * Construct page layout object from locally stored page layout sections and items
 * @param layoutId
 */
export const buildLayoutDetail = async (layoutId: string): Promise<SurveyLayout> => {
  // sections in the layout
  const sections: Array<SQLitePageLayoutSection> = await getRecords(
    DB_TABLE.PAGE_LAYOUT_SECTION,
    `where layoutId='${layoutId}'`
  );
  // items used in the sections
  const sectionIds = sections.map(s => s.id);
  const items: Array<SQLitePageLayoutItem> = await getRecords(
    DB_TABLE.PAGE_LAYOUT_ITEM,
    `where sectionId in (${sectionIds.map(id => `'${id}'`).join(',')})`
  );
  logger('FINE', 'buildLayoutDetail', items);

  // group items by section id
  const sectionIdToItems = items.reduce(
    (result, item) => ({
      ...result,
      [item.sectionId]: [...(result[item.sectionId] || []), item],
    }),
    {}
  );

  const layout: SurveyLayout = {
    sections: sections.map(s => ({
      id: s.id,
      title: s.sectionLabel,
      data: sectionIdToItems[s.id].map(item => ({
        name: item.fieldName,
        label: item.fieldLabel,
        type: item.fieldType,
      })),
    })),
  };

  return layout;
};
