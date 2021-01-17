export interface RecordType {
  name: string; // Primary key
  label: string;
  recordTypeId: string;
  layoutId: string;
}

export interface FieldTypeMapping {
  name: string;
  type: 'text' | 'integer' | 'blob'; // NOTICE: sqlite cannot have boolean type
}

export interface PageLayoutSection {
  id: string; // Primary key
  layoutId: string;
  sectionLabel: string;
}

export interface PageLayoutItem {
  sectionId: string;
  fieldName: string;
  fieldLabel: string;
  fieldType: string;
}

export interface PicklistValue {
  fieldName: string;
  label: string;
  value: string;
}

export interface Localization {
  type: string; // TODO: 'RecordType' | 'PageLayoutSection' | 'PageLayoutItem';
  locale: string; // TODO: 'en' | 'ne'
  name: string;
  label: string;
}

/**
 * sObject
 * TODO: Make this generic. Now this data model is specific for hayden hall.
 */
export interface Contact {
  id: string; // salesforce id,
  name: string;
  type: 'AnteNatelMother' | 'Mother' | 'Child' | 'Beneficiary';
  motherId: string;
  userId: string; // cdw contactid
}

/**
 * sObject.
 */
export interface Survey {
  syncStatus: 'Unsynced' | 'Synced';
  localId: string;
  RecordTypeId: string;
  // Following the fields on the survey object in Salesforce
}
