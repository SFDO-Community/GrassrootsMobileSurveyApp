/* eslint-disable @typescript-eslint/camelcase */
import { ImageStyle, ViewStyle, Dimensions } from 'react-native';

export const APP_FONTS = {
  FONT_REGULAR: 'SalesforceSans-Regular',
  FONT_BOLD: 'SalesforceSans-Bold',
  FONT_LIGHT: 'SalesforceSans-Light',
};

export const APP_THEME = {
  APP_BASE_COLOR: '#01579b',
  NAVIGATION_BACKGROUND: '#f8f8f8',
  APP_BASE_FONT_COLOR: '#01579b',
  APP_DARK_FONT_COLOR: '#2b2826',
  APP_LIGHT_FONT_COLOR: '#706e6b',
  APP_BORDER_COLOR: '#dedcdb',
  APP_ERROR_COLOR: '#94221c',
  APP_LIST_HEADER_COLOR: '#e1f5fe',
  APP_WHITE: 'white',
};

export const ASYNC_STORAGE_KEYS = {
  SALESFORCE_ACCESS_TOKEN: '@SalesforceAccessToken',
  SALESFORCE_INSTANCE_URL: '@SalesforceInstanceURL',
  CDW_WORKED_ID: '@CdwWorkedId',
  CDW_WORKED_NAME: '@CdwWorkedName',
  NETWORK_CONNECTIVITY: '@NetworkConnectivity',
  LANGUAGE: '@Language', // Will be deprecated for using device locale
  FIELD_TYPE: '@FieldType',
};

export const BACKGROUND_IMAGE_SOURCE = require('../assets/images/background.png');
const ratio = Dimensions.get('window').width / 1050; // 1050 is image width
const height = 534 * ratio;

// Style for background container
export const BACKGROUND_STYLE: ViewStyle = {
  flex: 1,
  backgroundColor: '#FFF',
};

// Style for background image itself
export const BACKGROUND_IMAGE_STYLE: ImageStyle = {
  resizeMode: 'contain',
  top: Dimensions.get('window').height / 2 + height / 2,
};

// TODO: Capitalize
export const DB_TABLE = {
  RecordType: 'RecordType',
  PageLayoutSection: 'PageLayoutSection',
  PageLayoutItem: 'PageLayoutItem',
  PICKLIST_VALUE: 'PicklistValue',
  SURVEY: 'Survey',
  Localization: 'Localization',
  CONTACT: 'Contact',
};

export const L10N_PREFIX = {
  RecordType: 'RECORD_TYPE_',
  PageLayoutSection: 'PAGE_LAYOUT_SECTION_',
  PageLayoutItem: 'PAGE_LAYOUT_ITEM_',
};

export const LOOKUP_TO_CONTACT = {
  Mother__c: 'Mother',
  Child__c: 'Child',
  Beneficiary_Name__c: 'Beneficiary',
};
