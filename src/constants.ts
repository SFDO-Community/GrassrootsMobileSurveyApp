import { ImageStyle, ViewStyle, Dimensions } from 'react-native';
import { SQLiteFieldTypeMapping } from './types/sqlite';
import { Language } from './types/metadata';

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
  APP_ERROR_COLOR: '#c23934',
  APP_LIST_HEADER_COLOR: '#e1f5fe',
  APP_WHITE: 'white',
  APP_SUCCESS_COLOR: '#04844b',
  APP_GRAY_BACKGROUND_COLOR: '#f3f2f2',
  APP_DISABLED_BACKGROUND_COLOR: '#c9c7c5',
};

export const ASYNC_STORAGE_KEYS = {
  SALESFORCE_INSTANCE_URL: '@SalesforceInstanceURL',
  FIELD_WORKER_CONTACT_ID: '@FieldWorkerContactId',
  FIELD_TYPE: '@FieldType',
  LANGUAGES: '@Languages',
};

export const SECURE_STORE_KEYS = {
  EMAIL: 'email',
  PASSWORD: 'password',
  ACCESS_TOKEN: 'token',
  HEROKU_APP_NAME: 'heroku',
};

export const BACKGROUND_IMAGE_SOURCE = require('../assets/images/background.png');
const ratio = Dimensions.get('window').width / 1050; // 1050 is image width
const height = 534 * ratio;

// Style for background container
export const BACKGROUND_STYLE: ViewStyle = {
  flex: 1,
  backgroundColor: APP_THEME.APP_WHITE,
};

// Style for background image itself
export const BACKGROUND_IMAGE_STYLE: ImageStyle = {
  resizeMode: 'contain',
  top: Dimensions.get('window').height / 2 + height / 2,
};

export const SURVEY_OBJECT = 'GRMS__Survey__c';
export const FIELD_WORKER_CONTACT_FIELD_ON_SURVEY = 'GRMS__FieldWorker__c';
export const SURVEY_DATE_FIELD = 'GRMS__SurveyDate__c';
export const AVAILABLE_LANGUAGE_CMDT = 'GRMS__AvailableLanguage__mdt';
export const RECORD_TYPE_ID_FIELD = 'RecordTypeId';
export const BACKGROUND_SURVEY_FIELDS = [
  { fieldName: 'Name', fieldType: 'string' },
  { fieldName: RECORD_TYPE_ID_FIELD, fieldType: 'reference' },
  { fieldName: FIELD_WORKER_CONTACT_FIELD_ON_SURVEY, fieldType: 'reference' },
  { fieldName: SURVEY_DATE_FIELD, fieldType: 'datetime' },
];
export const LOCAL_SURVEY_FIELDS: Array<SQLiteFieldTypeMapping> = [{ name: '_syncStatus', type: 'text' }];

export const SYNC_STATUS_SYNCED = 'Synced';
export const SYNC_STATUS_UNSYNCED = 'Unsynced';

export const SUBSCRIBER_PACKAGE_VERSION = '0336g000000kHHoAAM';
export const MIN_PACKAGE_VERSION = '0.4.0.5';

export const DB_TABLE = {
  RECORD_TYPE: 'RecordType',
  PAGE_LAYOUT_SECTION: 'PageLayoutSection',
  PAGE_LAYOUT_ITEM: 'PageLayoutItem',
  PICKLIST_VALUE: 'PicklistValue',
  SURVEY: 'Survey',
  LOCALIZATION: 'Localization',
  CONTACT: 'Contact',
};

export const L10N_PREFIX = {
  RecordType: 'RECORD_TYPE_',
  PageLayoutSectionId: 'PAGE_LAYOUT_SECTION_',
  PageLayoutItem: 'PAGE_LAYOUT_ITEM_',
};

export const DEFAULT_SF_LANGUAGE: Language = {
  name: 'English',
  code: 'en_US',
};
export const SUPPORTED_SF_LANGUAGES: Array<Language> = [
  { name: 'Chinese (Simplified)', code: 'zh_CN' },
  { name: 'Chinese (Traditional)', code: 'zh_TW' },
  { name: 'Danish', code: 'da' },
  { name: 'Dutch', code: 'nl_NL' },
  DEFAULT_SF_LANGUAGE,
  { name: 'Finnish', code: 'fi' },
  { name: 'French', code: 'fr' },
  { name: 'German', code: 'de' },
  { name: 'Italian', code: 'it' },
  { name: 'Japanese', code: 'ja' },
  { name: 'Korean', code: 'ko' },
  { name: 'Norwegian', code: 'no' },
  { name: 'Portuguese (Brazil)', code: 'pt_BR' },
  { name: 'Russian', code: 'ru' },
  { name: 'Spanish', code: 'es' },
  { name: 'Spanish (Mexico)', code: 'es_MX' },
  { name: 'Swedish', code: 'sv' },
  { name: 'Thai', code: 'th' },
  { name: 'Nepali', code: 'ne' }, // For HaydenHall ❤️🇳🇵
];
