import React, { useState, useEffect } from 'react';
import * as Font from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import FlashMessage from 'react-native-flash-message';

import Router from './src/Router';
import { initializeStorage } from './src/utility/storage';
import { LocalizationContextProvider } from './src/context/localizationContext';
import { AuthContextProvider } from './src/context/authContext';
import { SurveyEditorContextProvider } from './src/context/surveyEditorContext';

export default function App() {
  const [fontLoaded, setFontLoaded] = useState(false);

  useEffect(() => {
    initializeStorage();
    const loadFont = async () => {
      await Font.loadAsync({
        'SalesforceSans-Regular': require('./assets/fonts/SalesforceSans-Regular.ttf'),
        'SalesforceSans-Bold': require('./assets/fonts/SalesforceSans-Bold.ttf'),
        'SalesforceSans-Light': require('./assets/fonts/SalesforceSans-Light.ttf'),
      });
      setFontLoaded(true);
    };
    loadFont();
  }, []);

  return fontLoaded ? (
    <LocalizationContextProvider>
      <AuthContextProvider>
        <SurveyEditorContextProvider>
          <Router />
        </SurveyEditorContextProvider>
      </AuthContextProvider>
      <FlashMessage position="top" />
      <StatusBar style="dark" />
    </LocalizationContextProvider>
  ) : null;
}
