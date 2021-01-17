import { storeRecordTypes, storePageLayoutItems, storeLocalization } from './salesforce/metadata';
import { saveRecords, getAllRecords, getRecords, clearTable } from './database/database';
import { getAllRecordTypes } from './database/metadata';
import { SQLitePageLayoutSection, SQLitePageLayoutItem } from '../types/sqlite';
import { SurveyLayout } from '../types/survey';

import { logger } from '../utility/logger';
import { ASYNC_STORAGE_KEYS, DB_TABLE, L10N_PREFIX } from '../constants';
import i18n from '../config/i18n';

/**
 * @description Download record types, all the page layouts, and localization custom metadata.
 * @todo For surveys and contacts?
 */
export const retrieveAllMetadata = async () => {
  try {
    // Record types
    await clearTable(DB_TABLE.RecordType);
    const recordTypes = await storeRecordTypes();
    // Page Layout
    await clearTable(DB_TABLE.PageLayoutSection);
    await clearTable(DB_TABLE.PageLayoutItem);
    const serializedPicklistValueSet = new Set();
    const serializedFieldTypeSet = new Set();
    for (const rt of recordTypes) {
      const pageLayoutResult = await storePageLayoutItems(rt.recordTypeId);
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
    await clearTable(DB_TABLE.Localization);
    await storeLocalization();
  } catch {
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
    DB_TABLE.PageLayoutSection,
    `where layoutId='${layoutId}'`
  );
  // items used in the sections
  const sectionIds = sections.map(s => s.id);
  const items: Array<SQLitePageLayoutItem> = await getRecords(
    DB_TABLE.PageLayoutItem,
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
