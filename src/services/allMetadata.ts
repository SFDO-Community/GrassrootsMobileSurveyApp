import {
  storeRecordTypesWithCompactLayout,
  storePageLayoutItems,
  storePageLayoutSections,
  storeLocalization,
} from './salesforce/metadata';
import { saveRecords, clearTable } from './database/database';
import { SQLitePicklistValue } from '../types/sqlite';
import { CompositeLayoutResponse, DescribeLayout } from '../types/metadata';

import { logger } from '../utility/logger';
import { ASYNC_STORAGE_KEYS, DB_TABLE, METADATA_ERROR, MIN_PACKAGE_VERSION, SURVEY_OBJECT } from '../constants';
import { describeLayouts } from './salesforce/core';
import { validateInstalledPackageVersion } from './salesforce/installedPackage';

/**
 * @description Download record types, all the page layouts, and localization custom metadata.
 */
export const retrieveAllMetadata = async () => {
  try {
    // Store package version
    await validateInstalledPackageVersion();
    // Record types with compact layout title
    await clearTable(DB_TABLE.RECORD_TYPE);
    const recordTypes = await storeRecordTypesWithCompactLayout();
    // Page layout sections and fields
    await clearTable(DB_TABLE.PAGE_LAYOUT_SECTION);
    await clearTable(DB_TABLE.PAGE_LAYOUT_ITEM);
    const picklistOptionsMap: Map<string, Array<SQLitePicklistValue>> = new Map();
    const fieldTypesMap = new Map();
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
      pageLayoutResult.picklistValuesMap.forEach((v, k) => picklistOptionsMap.set(k, v));
      pageLayoutResult.fieldTypesMap.forEach((v, k) => fieldTypesMap.set(k, v));
    }
    // Picklist options
    await clearTable(DB_TABLE.PICKLIST_VALUE);
    const picklistValues = Array.from(picklistOptionsMap.values()).flat();
    await saveRecords(DB_TABLE.PICKLIST_VALUE, picklistValues, undefined);

    // Field type object
    const fieldType = Array.from(fieldTypesMap.values()).reduce((result, current) => {
      result[current.name] = current.type;
      return result;
    }, {});
    storage.save({ key: ASYNC_STORAGE_KEYS.FIELD_TYPE, data: fieldType });
    // Localization
    await clearTable(DB_TABLE.LOCALIZATION);
    await storeLocalization();
  } catch (e) {
    logger('ERROR', 'retrieveAllMetadata', e);
    if (e.error === METADATA_ERROR.INVALID_PACKAGE_VERSION) {
      throw new Error(
        `Salesforce package is not installed or the installed package looks old. Update the package to at least version ${MIN_PACKAGE_VERSION}.`
      );
    } else if (e.error === METADATA_ERROR.INVALID_RECORD_TYPE) {
      throw new Error('Invalid record type found on Survey object. Contact your administrator.');
    } else if (e.error === METADATA_ERROR.NO_EDITABLE_FIELDS) {
      throw new Error('No editable fields on Survey layout. Contact your administrator.');
    }
    throw new Error('Unexpected error occurred while retrieving survey settings. Contact your administrator.');
  }
};
