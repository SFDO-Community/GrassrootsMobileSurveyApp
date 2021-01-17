export interface SQLiteRecordType {
  name: string; // Primary key
  label: string;
  recordTypeId: string;
  layoutId: string;
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

export interface SQLitePageLayoutItem {
  sectionId: string;
  fieldName: string;
  fieldLabel: string;
  fieldType: string;
}

export interface SQLitePicklistValue {
  fieldName: string;
  label: string;
  value: string;
}

export interface SQLiteLocalization {
  type: string; // TODO: 'RecordType' | 'PageLayoutSection' | 'PageLayoutItem';
  locale: string; // TODO: 'en' | 'ne'
  name: string;
  label: string;
}

/**
 * sObject
 * TODO: Make this generic. Now this data model is specific for hayden hall.
 */
export interface SQLiteContact {
  id: string; // salesforce id,
  name: string;
  type: 'AnteNatelMother' | 'Mother' | 'Child' | 'Beneficiary';
  motherId: string;
  userId: string; // cdw contactid
}

/**
 * sObject.
 */
export interface SQLiteSurvey {
  syncStatus: 'Unsynced' | 'Synced';
  localId: string;
  RecordTypeId: string;
  // Following the fields on the survey object in Salesforce
}
