import { getAllRecords } from './database/database';
import { prepareLocalizationTable } from './database/localization';

import { logger } from '../utility/logger';
import { DB_TABLE, DEFAULT_SF_LANGUAGE, L10N_PREFIX, SURVEY_OBJECT } from '../constants';
import i18n from '../config/i18n';
import { getAvailableLanguages } from './salesforce/metadata';
import { getLocalizedObjectInfo } from './salesforce/core';

/**
 * @description Build expo-localization object from locally stored tables
 * @todo Remove duplicates in the table (i.e., field used in multiple layouts)
 */
export const buildDictionary = async () => {
  // original labels
  const recordTypes = await getAllRecords(DB_TABLE.RECORD_TYPE);
  const recordTypeLabels = recordTypes.reduce((result, current) => {
    result[`${L10N_PREFIX.RecordType}${current.recordTypeId}`] = current.label;
    return result;
  }, {});
  const sections = await getAllRecords(DB_TABLE.PAGE_LAYOUT_SECTION);
  const sectionLabels = sections.reduce((result, current) => {
    result[`${L10N_PREFIX.PageLayoutSectionId}${current.id}`] = current.sectionLabel;
    return result;
  }, {});
  const fields = await getAllRecords(DB_TABLE.PAGE_LAYOUT_ITEM);
  const fieldLabels = fields.reduce((result, current) => {
    result[`${L10N_PREFIX.PageLayoutItem}${current.fieldName}`] = current.fieldLabel;
    return result;
  }, {});
  const originalLabels = { ...recordTypeLabels, ...sectionLabels, ...fieldLabels };
  logger('FINE', 'buildDictionary', originalLabels);
  // Get standard translated labels
  const availableLanguages = await getAvailableLanguages();
  const dict = {};
  for (const language of availableLanguages) {
    if (language.code === DEFAULT_SF_LANGUAGE.code) {
      continue;
    }
    let localizedRecordTypes = {};
    let localizedSectionLabels = {};
    let localizedFieldLabels = {};
    for (const recordType of recordTypes) {
      const recordDefaultResponse = await getLocalizedObjectInfo(SURVEY_OBJECT, recordType.recordTypeId, language.code);
      // Record Types
      if (Object.keys(localizedRecordTypes).length === 0) {
        const recordTypeInfosResponse = recordDefaultResponse.objectInfos[SURVEY_OBJECT].recordTypeInfos;
        localizedRecordTypes = Object.values(recordTypeInfosResponse).reduce((result, current) => {
          result[`${L10N_PREFIX.RecordType}${current.recordTypeId}`] = current.name;
          return result;
        }, {});
      }
      // Sections
      localizedSectionLabels = recordDefaultResponse.layout.sections.reduce((result, current) => {
        result[`${L10N_PREFIX.PageLayoutSectionId}${current.id}`] = current.heading;
        return result;
      }, localizedSectionLabels);
      // Fields
      const fieldsResponse = recordDefaultResponse.objectInfos[SURVEY_OBJECT].fields;
      localizedFieldLabels = Object.values(fieldsResponse).reduce((result, current) => {
        result[`${L10N_PREFIX.PageLayoutItem}${current.apiName}`] = current.label;
        return result;
      }, localizedFieldLabels);
    }

    const localizedLabels = { ...localizedRecordTypes, ...localizedSectionLabels, ...localizedFieldLabels };
    dict[language.code] = localizedLabels;
  }

  // Create localization table for unsupported languages
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
  for (const lang of Object.keys(dict)) {
    i18n.translations[lang] = {
      ...i18n.translations[lang],
      ...dict[lang],
    };
  }
};
