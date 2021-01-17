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
  layoutComponents: Array<DescribeLayoutComponent>; // Basically single component, but aggregation fields like address have multiple components
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
  Locale__c: string;
  OriginalName__c: string;
  TranslatedLabel__c: string;
  Type__c: string;
}
