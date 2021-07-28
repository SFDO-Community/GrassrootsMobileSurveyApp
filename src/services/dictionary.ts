import { getAllRecords } from './database/database';
import { prepareLocalizationTable } from './database/localization';

import { logger } from '../utility/logger';
import { DB_TABLE, L10N_PREFIX } from '../constants';
import i18n from '../config/i18n';

/**
 * @description Build expo-localization object from locally stored tables
 * @todo Remove duplicates in the table (i.e., field used in multiple layouts)
 */
export const buildDictionary = async () => {
  // original labels
  const recordTypes = await getAllRecords(DB_TABLE.RECORD_TYPE);
  const recordTypeLabels = recordTypes.reduce((result, current) => {
    result[`${L10N_PREFIX.RecordType}${current.developerName}`] = current.label;
    return result;
  }, {});
  const sections = await getAllRecords(DB_TABLE.PAGE_LAYOUT_SECTION);
  const sectionLabels = sections.reduce((result, current) => {
    result[`${L10N_PREFIX.PageLayoutSection}${current.sectionLabel}`] = current.sectionLabel;
    return result;
  }, {});
  const fields = await getAllRecords(DB_TABLE.PAGE_LAYOUT_ITEM);
  const fieldLabels = fields.reduce((result, current) => {
    result[`${L10N_PREFIX.PageLayoutItem}${current.fieldName}`] = current.fieldLabel;
    return result;
  }, {});
  const originalLabels = { ...recordTypeLabels, ...sectionLabels, ...fieldLabels };
  logger('FINE', 'buildDictionary', originalLabels);

  // Create localization table first for no records in salesforce
  await prepareLocalizationTable();
  const translatedRecordTypes = await getAllRecords(DB_TABLE.LOCALIZATION);
  const translatedLabels = translatedRecordTypes.reduce((result, current) => {
    result[`${L10N_PREFIX[current.type]}${current.name}`] = current.label;
    return result;
  }, {});
  logger('FINE', 'buildDictionary', translatedLabels);

  i18n.translations = {
    en: {
      ...i18n.translations.en,
      ...originalLabels,
    },
    ne: {
      ...i18n.translations.ne,
      ...translatedLabels,
    },
  };
};
