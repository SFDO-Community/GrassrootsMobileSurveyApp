/**
 * @description List of mapping of record type and assigend page layout
 * @see https://developer.salesforce.com/docs/atlas.en-us.api.meta/api/sforce_api_calls_describelayout_describelayoutresult.htm#i1425854
 */
export interface DescribeLayoutResult {
  recordTypeMappings: Array<RecordTypeMapping>;
}

export interface RecordTypeMapping {
  active: boolean;
  available: boolean;
  defaultRecordTypeMapping: boolean;
  developerName: string;
  layoutId: string;
  master: boolean;
  name: string;
  recordTypeId: string;
  url: {
    layout: string;
  };
}

/**
 * @description Page layout metadata
 * @see https://developer.salesforce.com/docs/atlas.en-us.api.meta/api/sforce_api_calls_describelayout_describelayoutresult.htm#i1425854
 */
export interface DescribeLayout {
  editLayoutSections: Array<DescribeLayoutSection>;
  id: string;
}

export interface DescribeLayoutSection {
  useHeading: boolean;
  heading: string;
  parentLayoutId: string;
  layoutSectionId: string;
  tabOrder: 'LeftToRight' | 'TopToBottom';
  layoutRows: Array<DescribeLayoutRow>;
}

export interface DescribeLayoutRow {
  layoutItems: Array<DescribeLayoutItem>;
}

export interface DescribeLayoutItem {
  label: string;
  layoutComponents: Array<DescribeLayoutComponent>; // Basically single component, but aggregation fields like address have multiple components
  required: boolean;
}

export interface DescribeLayoutComponent {
  details: DescribeFieldProperties;
  type: string;
}

export interface DescribeFieldProperties {
  label: string; // Field Label;
  name: string; // Field API Name
  type: string; // Data, Reference,
  picklistValues?: Array<DescribePicklistValue>;
  updateable: boolean;
  referenceTo: Array<string>;
}

export interface DescribePicklistValue {
  active: boolean;
  defaultValue: boolean;
  label: string;
  validFor: string;
  value: string;
}

export interface LocalizationCustomMetadata {
  MasterLabel: string;
  DeveloperName: string;
  GRMS__Locale__c: string;
  GRMS__OriginalName__c: string;
  GRMS__TranslatedLabel__c: string;
  GRMS__Type__c: string;
}

export interface CompositeLayoutResponse {
  compositeResponse: Array<CompositeLayoutResult>;
}
export interface CompositeLayoutResult {
  body: DescribeLayout;
  httpStatusCode: number;
  referenceId: string;
}

export interface CompositeCompactLayoutResponse {
  compositeResponse: Array<CompositeCompactLayoutResult>;
}

export interface CompositeCompactLayoutResult {
  body: {
    fieldItems: Array<DescribeLayoutItem>;
    name: string;
  };
  httpStatusCode: number;
  referenceId: string;
}

export interface RecordDefaultsResponse {
  objectInfos: {
    [objectName: string]: {
      recordTypeInfos: object;
      fields: {
        [apiName: string]: {
          apiName: string;
          label: string;
        };
      };
    };
  };
  layout: RecordLayout;
}

/**
 * https://developer.salesforce.com/docs/atlas.en-us.uiapi.meta/uiapi/ui_api_responses_record_layout.htm#ui_api_responses_record_layout
 */
export interface RecordLayout {
  id: string;
  recordTypeId: string;
  sections: Array<RecordLayoutSection>;
}

export interface RecordLayoutSection {
  id: string;
  heading: string;
}

export type Language = {
  name: string;
  code: string;
};
