import * as Localization from 'expo-localization';
import i18n from 'i18n-js';

import ne from './locale/ne_IN.json';
import en from './locale/en_US.json';

//expo-localization gives the result in a language-region format
const deviceLocale: string =
  Localization.locale.indexOf('-') !== 0 ? Localization.locale.split('-')[0] : Localization.locale;

i18n.defaultLocale = deviceLocale === 'ne' ? deviceLocale : 'en';
i18n.locale = deviceLocale === 'ne' ? deviceLocale : 'en';
i18n.fallbacks = true;
i18n.translations = { en, ne };

export default i18n;
