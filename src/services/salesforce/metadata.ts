import { describeCompactLayouts, describeLayoutResult, fetchSalesforceRecords } from './core';
import { saveRecords } from '../database/database';

import {
  SQLiteRawRecordType,
  SQLiteSurveyTitle,
  SQLiteRecordType,
  SQLitePageLayoutSection,
  SQLitePageLayoutItem,
  SQLitePicklistValue,
  SQLiteLocalization,
} from '../../types/sqlite';
import {
  DescribeLayoutResult,
  DescribeLayout,
  LocalizationCustomMetadata,
  CompositeCompactLayoutResponse,
} from '../../types/metadata';

import { logger } from '../../utility/logger';
import { DB_TABLE, SURVEY_OBJECT, BACKGROUND_SURVEY_FIELDS } from '../../constants';

/**
 * @description Query record types by REST API (describe layouts) and save the results to local database.
 * Expect that at least one record type exists in the org.
 */
export const storeRecordTypesWithCompactLayout = async () => {
  const response: DescribeLayoutResult = await describeLayoutResult(SURVEY_OBJECT);
  // Reject a record type manually named 'Master'
  if (
    response.recordTypeMappings.length === 1 &&
    response.recordTypeMappings[0].developerName === 'Master' &&
    response.recordTypeMappings[0].master === false
  ) {
    return Promise.reject({ error: 'invalid_record_type' });
  }
  const recordTypes: Array<SQLiteRawRecordType> = response.recordTypeMappings
    .filter(r => r.active)
    .filter((r, i, array) => (array.length > 1 ? r.master === false : true))
    .map(r => ({
      developerName: r.developerName,
      label: r.name,
      recordTypeId: r.recordTypeId,
      layoutId: r.layoutId,
    }));
  const compositeCompactLayoutResponse: CompositeCompactLayoutResponse = await describeCompactLayouts(
    SURVEY_OBJECT,
    recordTypes.map(r => r.recordTypeId)
  );
  const recordTypeIdToTitleFieldMap: Map<string, SQLiteSurveyTitle> = new Map(
    compositeCompactLayoutResponse.compositeResponse.map(cl => {
      const titleField = cl.body.fieldItems.find(f => {
        const dlc = f.layoutComponents[0];
        return dlc.details.referenceTo.length === 0;
      });
      const titleFieldName = titleField?.layoutComponents[0].details.name;
      const titleFieldType = titleField?.layoutComponents[0].details.type;
      const titleFieldUpdateable = titleField?.layoutComponents[0].details.updateable;
      return [cl.referenceId, { titleFieldName, titleFieldType, titleFieldUpdateable }];
    })
  );

  const recordTypesWithTitle: Array<SQLiteRecordType> = recordTypes.map(rt => ({
    ...rt,
    titleFieldName: recordTypeIdToTitleFieldMap.get(rt.recordTypeId).titleFieldName,
    titleFieldType: recordTypeIdToTitleFieldMap.get(rt.recordTypeId).titleFieldType,
    titleFieldUpdateable: recordTypeIdToTitleFieldMap.get(rt.recordTypeId).titleFieldUpdateable,
  }));
  logger('DEBUG', 'storeRecordTypes', `${JSON.stringify(recordTypesWithTitle)}`);
  await saveRecords(DB_TABLE.RECORD_TYPE, recordTypesWithTitle, 'developerName');
  return recordTypes;
};

/**
 * @description Extract editable fields and picklist values from layout metadata and save them to local database.
 * @param layout
 * @return { fieldTypesMap, picklistValuesMap }
 */
export const storePageLayoutItems = async (layout: DescribeLayout) => {
  const backgroundFields = BACKGROUND_SURVEY_FIELDS.map(f => f.fieldName).filter(n => n !== 'Name');
  const picklistValuesMap: Map<string, Array<SQLitePicklistValue>> = new Map<string, Array<SQLitePicklistValue>>();
  const pageLayoutItems: Array<SQLitePageLayoutItem> = layout.editLayoutSections
    .filter(section => section.useHeading)
    .map(section => {
      return section.layoutRows.map(row => {
        return row.layoutItems.map(item => {
          // Avoid adding empty space, read-only field, and user contact lookup field
          const layoutComponents = item.layoutComponents
            .filter(
              c =>
                c.type !== 'EmptySpace' &&
                c.details.updateable &&
                (c.details.referenceTo.length === 0 || c.details.referenceTo[0] === 'Contact') &&
                !backgroundFields.includes(c.details.name)
            )
            .map(c => {
              if (c.details.type === 'picklist') {
                const values: Array<SQLitePicklistValue> = c.details.picklistValues
                  .filter(v => v.active)
                  .map(v => ({
                    fieldName: c.details.name,
                    label: v.label,
                    value: v.value,
                  }));
                picklistValuesMap.set(c.details.name, values);
              }
              return {
                sectionId: section.layoutSectionId,
                fieldName: c.details.name,
                fieldLabel: c.details.label,
                fieldType: c.details.type,
              };
            });
          return layoutComponents.map(lc => ({ ...lc, required: item.required }));
        });
      });
    })
    .flat(3);
  logger('DEBUG', 'storePageLayoutItems | items', pageLayoutItems);
  if (pageLayoutItems.length === 0) {
    return Promise.reject({ error: 'no_editable_fields' });
  }
  await saveRecords(DB_TABLE.PAGE_LAYOUT_ITEM, pageLayoutItems, undefined);

  const fieldTypesMap = new Map(
    pageLayoutItems.map(item => [item.fieldName, { name: item.fieldName, type: item.fieldType }])
  );
  return { fieldTypesMap, picklistValuesMap };
};

/**
 * @description Extract section data from layout metadata and save it to local database.
 * @param layout
 */
export const storePageLayoutSections = async (layout: DescribeLayout) => {
  const pageLayoutSections: Array<SQLitePageLayoutSection> = layout.editLayoutSections
    .filter(section => section.useHeading)
    .map(section => ({
      id: section.layoutSectionId,
      layoutId: section.parentLayoutId,
      sectionLabel: section.heading,
    }));
  logger('DEBUG', 'storePageLayoutItems | sections', pageLayoutSections);
  await saveRecords(DB_TABLE.PAGE_LAYOUT_SECTION, pageLayoutSections, 'id');
};

/**
 * @description Retrieve Salesforce 'Localization__mdt' Custom Metadata records and save them to local database
 */
export const storeLocalization = async () => {
  const query =
    'SELECT GRMS_Type__c, GRMS_Locale__c, GRMS_OriginalName__c, GRMS_TranslatedLabel__c FROM GRMS_Localization__mdt';
  const records: Array<LocalizationCustomMetadata> = await fetchSalesforceRecords(query);
  if (records.length === 0) {
    return;
  }
  const localizations: Array<SQLiteLocalization> = records.map(r => {
    return {
      locale: r.GRMS_Locale__c,
      type: r.GRMS_Type__c,
      name: r.GRMS_OriginalName__c,
      label: r.GRMS_TranslatedLabel__c ? r.GRMS_TranslatedLabel__c.replace(/'/g, "''") : '', // escape single quote for sqlite
    };
  });
  await saveRecords(DB_TABLE.LOCALIZATION, localizations, undefined);
};
