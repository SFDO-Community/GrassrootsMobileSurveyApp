import { describeLayoutResult, describeLayout, fetchSalesforceRecords } from './api/salesforce/core';
import { saveRecords, getAllRecords, getRecords, clearTable } from './database';

import { RecordType, PageLayoutSection, PageLayoutItem, PicklistValue, Localization } from '../types/sqlite';
import { SurveyLayout } from '../types/survey';
import { DescribeLayoutResult, DescribeLayout, LocalizationCustomMetadata } from '../types/metadata';

import { logger } from '../utility/logger';
import { ASYNC_STORAGE_KEYS, DB_TABLE, L10N_PREFIX } from '../constants';
import { SURVEY_OBJECT } from '@env';
import i18n from '../config/i18n';

/**
 * @description Download record types, all the page layouts, and localization custom metadata.
 * @todo For surveys and contacts?
 */
export const retrieveAllMetadata = async () => {
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
  logger('DEBUG', 'picklistvalues refres', picklistValues);
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

  // Dictionary
  await clearTable(DB_TABLE.Localization);
  await storeLocalization();
  await buildDictionary();
};

/**
 * @description Query record types by REST API (describe layouts) and save the results to local database.
 */
export const storeRecordTypes = async () => {
  const response: DescribeLayoutResult = await describeLayoutResult(SURVEY_OBJECT);
  const recordTypes: Array<RecordType> = response.recordTypeMappings
    .filter(r => r.active && r.name !== 'Master') // TODO: For single record type and navigation
    .map(r => ({
      name: r.developerName,
      label: r.name,
      recordTypeId: r.recordTypeId,
      layoutId: r.layoutId,
    }));
  logger('DEBUG', 'storeRecordTypes', `${JSON.stringify(recordTypes)}`);
  await saveRecords(DB_TABLE.RecordType, recordTypes, 'name');
  storage.save({
    key: '@RecordTypes',
    data: recordTypes,
  });
  return recordTypes;
};

/**
 * @description Query layouts and fields including picklist values by Rest API (describe layout) and save the result to local database.
 * @param recordTypeId
 * @return serializedPicklistValueSet
 */
const storePageLayoutItems = async (recordTypeId: string) => {
  const response: DescribeLayout = await describeLayout(SURVEY_OBJECT, recordTypeId);
  const pageLayoutSections: Array<PageLayoutSection> = response.editLayoutSections
    .filter(section => section.useHeading)
    .map(section => ({
      id: section.layoutSectionId,
      layoutId: section.parentLayoutId,
      sectionLabel: section.heading,
    }));
  logger('FINE', 'storePageLayoutItems | sections', pageLayoutSections);
  await saveRecords(DB_TABLE.PageLayoutSection, pageLayoutSections, 'id');

  const serializedPicklistValueSet: Set<string> = new Set();
  const pageLayoutItems: Array<PageLayoutItem> = response.editLayoutSections
    .filter(section => section.useHeading)
    .map(section => {
      return section.layoutRows.map(row => {
        return row.layoutItems.map(item => {
          return item.layoutComponents
            .filter(c => c.type !== 'EmptySpace')
            .map(c => {
              if (c.details.type === 'picklist') {
                const values: Array<PicklistValue> = c.details.picklistValues
                  .filter(v => v.active)
                  .map(v => ({
                    fieldName: c.details.name,
                    label: v.label,
                    value: v.value,
                  }));
                values.forEach(v => {
                  serializedPicklistValueSet.add(JSON.stringify(v));
                });
              }
              return {
                sectionId: section.layoutSectionId,
                fieldName: c.details.name,
                fieldLabel: c.details.label,
                fieldType: c.details.type,
              };
            });
        });
      });
    })
    .flat(3);
  logger('DEBUG', 'storePageLayoutItems | items', pageLayoutItems);
  await saveRecords(DB_TABLE.PageLayoutItem, pageLayoutItems, undefined);

  const serializedFieldTypeSet = [
    ...pageLayoutItems.map(item => JSON.stringify({ name: item.fieldName, type: item.fieldType })),
  ];
  return { serializedPicklistValueSet, serializedFieldTypeSet };
};

/**
 * @description Retrieve Salesforce 'Localization__mdt' Custom Metadata records and save them to local database
 */
const storeLocalization = async () => {
  const query = 'SELECT Type__c, Locale__c, OriginalName__c, TranslatedLabel__c FROM Localization__mdt';
  const records: Array<LocalizationCustomMetadata> = await fetchSalesforceRecords(query);
  if (records.length === 0) {
    return;
  }
  const localizations: Array<Localization> = records.map(r => {
    return {
      locale: r.Locale__c,
      type: r.Type__c,
      name: r.OriginalName__c,
      label: r.TranslatedLabel__c ? r.TranslatedLabel__c.replace(/'/g, "''") : '', // escape single quote for sqlite
    };
  });
  await saveRecords(DB_TABLE.Localization, localizations, undefined);
};

/**
 * @description Get all the record types of the survey object from local database
 */
export const getAllRecordTypes = async (): Promise<Array<RecordType>> => {
  const recordTypes: Array<RecordType> = await getAllRecords(DB_TABLE.RecordType);
  return recordTypes;
};

/**
 * Construct page layout object from locally stored page layout sections and items
 * @param layoutId
 */
export const buildLayoutDetail = async (layoutId: string): Promise<SurveyLayout> => {
  // sections in the layout
  const sections: Array<PageLayoutSection> = await getRecords(
    DB_TABLE.PageLayoutSection,
    `where layoutId='${layoutId}'`
  );
  // items used in the sections
  const sectionIds = sections.map(s => s.id);
  const items: Array<PageLayoutItem> = await getRecords(
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

/**
 * @description
 * @param fieldName
 */
export const getPicklistValues = async (fieldName: string) => {
  const recordTypes: Array<PicklistValue> = await getRecords(DB_TABLE.PICKLIST_VALUE, `where fieldName='${fieldName}'`);
  return recordTypes;
};

/**
 * @description Build expo-localization object from locally stored tables
 * @todo Remove duplicates in the table (i.e., field used in multiple layouts)
 */
export const buildDictionary = async () => {
  // original labels
  const recordTypes = await getAllRecordTypes();
  const recordTypeLabels = recordTypes.reduce((result, current) => {
    result[`${L10N_PREFIX.RecordType}${current.name}`] = current.label;
    return result;
  }, {});
  const sections = await getAllRecords(DB_TABLE.PageLayoutSection);
  const sectionLabels = sections.reduce((result, current) => {
    result[`${L10N_PREFIX.PageLayoutSection}${current.sectionLabel}`] = current.sectionLabel;
    return result;
  }, {});
  const fields = await getAllRecords(DB_TABLE.PageLayoutItem);
  const fieldLabels = fields.reduce((result, current) => {
    result[`${L10N_PREFIX.PageLayoutItem}${current.fieldName}`] = current.fieldLabel;
    return result;
  }, {});

  const originalLabels = { ...recordTypeLabels, ...sectionLabels, ...fieldLabels };
  logger('FINE', 'buildDictionary', originalLabels);
  // localization.
  // TODO: create localization table first for no records in salesforce
  const translatedRecordTypes = await getAllRecords(DB_TABLE.Localization);
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
  // field
};
