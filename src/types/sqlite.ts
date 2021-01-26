export interface SQLiteRecordType {
  developerName: string; // Primary key
  label: string;
  recordTypeId: string;
  layoutId: string;
  titleFieldName?: string;
  titleFieldType?: string;
}

export interface SQLiteFieldTypeMapping {
  name: string;
  type: 'text' | 'integer' | 'blob'; // NOTICE: sqlite cannot have boolean type
}

export interface SQLitePageLayoutSection {
  id: string; // Primary key
  layoutId: string;
  sectionLabel: string;
}

export interface SQLitePageLayoutItem extends SObjectField {
  sectionId: string;
  fieldType: string;
}

export interface SObjectField {
  fieldName: string;
  fieldType: string;
}

export interface SQLitePicklistValue {
  fieldName: string;
  label: string;
  value: string;
}

export interface SQLiteLocalization {
  type: string; // TODO: 'RecordType' | 'PageLayoutSection' | 'PageLayoutItem';
  locale: string;
  name: string;
  label: string;
}

/**
 * sObject
 */
export interface SQLiteContact {
  id: string; // salesforce contact record id,
  name: string;
  type: string; // Type__c field on relationship record
}

/**
 * sObject.
 */
export interface SQLiteSurvey {
  _syncStatus?: 'Unsynced' | 'Synced';
  _localId?: string;
  RecordTypeId?: string;
  // Following the fields on the survey object in Salesforce
}
