import { ASYNC_STORAGE_KEYS } from '../../constants';
import { SQLiteFieldTypeMapping } from '../../types/sqlite';
import { getAvailableLanguages } from '../salesforce/metadata';
import { prepareTable } from './database';

export const prepareLocalizationTable = async () => {
  const fieldTypeMappings: Array<SQLiteFieldTypeMapping> = [
    { name: 'Type__c', type: 'text' },
    { name: 'Locale__c', type: 'text' },
    { name: 'OriginalName__c', type: 'text' },
    { name: 'TranslatedLabel__c', type: 'text' },
  ];
  await prepareTable('Localization', fieldTypeMappings, undefined);
};

export const storeAvailableLanguages = async () => {
  const availableLanguages = await getAvailableLanguages();
  storage.save({ key: ASYNC_STORAGE_KEYS.LANGUAGES, data: availableLanguages });
};
