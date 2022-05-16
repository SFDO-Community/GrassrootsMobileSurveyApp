import React, { useContext, useMemo, useState } from 'react';
import i18n from '../config/i18n';

export const LocalizationContext = React.createContext(null);

export const useLocalizationContext = () => useContext(LocalizationContext);

// eslint-disable-next-line react/prop-types
export const LocalizationContextProvider: React.FC = ({ children }) => {
  const [locale, setLocale] = useState(i18n.locale);
  const localizationContextValue = useMemo(
    () => ({
      t: (scope, options) => i18n.t(scope, { locale, ...options }),
      locale,
      setLocale,
    }),
    [locale]
  );
  return <LocalizationContext.Provider value={localizationContextValue}>{children}</LocalizationContext.Provider>;
};
