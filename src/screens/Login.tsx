import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, Image, ImageBackground } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import * as SecureStore from 'expo-secure-store';

import { CustomButton, Loader } from '../components';
import { Input } from 'react-native-elements';

import { validateEmail } from '../utility';
import { logger } from '../utility/logger';
import {
  ASYNC_STORAGE_KEYS,
  BACKGROUND_IMAGE_SOURCE,
  BACKGROUND_STYLE,
  BACKGROUND_IMAGE_STYLE,
  APP_FONTS,
  APP_THEME,
} from '../constants';
import LocalizationContext from '../context/localizationContext';

import { authenticate } from '../services/api/auth';
import { notifyError } from '../utility/notification';

export default function Login({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showsSpinner, setShowsSpinner] = useState(false);

  const { t } = useContext(LocalizationContext);

  useEffect(() => {
    hasLoggedIn();
  }, []);

  /**
   * @description Check the user has logged in or not yet.
   */
  const hasLoggedIn = async () => {
    setShowsSpinner(true);

    const cdwWorkedId = await storage
      .load({
        key: ASYNC_STORAGE_KEYS.CDW_WORKED_ID,
      })
      .catch(() => {
        logger('INFO', 'Login', 'User has not logged in yet');
      });
    setShowsSpinner(false);
    //if user already logged in (= has CDW Id), navigate to survey list
    if (cdwWorkedId) {
      logger('INFO', 'Login', `User is already logged in as ${cdwWorkedId}`);
      navigation.navigate('SurveyList');
    }
  };

  const validateInput = () => {
    if (email.length == 0) {
      setEmailError(t('ENTER_EMAIL'));
      return false;
    }
    if (!validateEmail(email)) {
      setEmailError(t('ENTER_VALID_EMAIL'));
      return false;
    }
    if (password.length == 0) {
      setPasswordError(t('ENTER_PASSWORD'));
      return false;
    }
    setEmailError(undefined);
    setPasswordError(undefined);
    return true;
  };

  /**
   * @description Validate form input, retrieve access token, and then navigate to area code screen
   */
  const login = async () => {
    if (!validateInput()) {
      return;
    }
    try {
      setShowsSpinner(true);
      const loginResponse = await authenticate(email, password);
      await SecureStore.setItemAsync('email', email);
      await SecureStore.setItemAsync('password', password);
      logger('DEBUG', 'Login', `${JSON.stringify(loginResponse)}`);
      // TODO: Re-login from survey list screen
      navigation.navigate('AreaCode');
    } catch (error) {
      notifyError(error.error_description);
    } finally {
      setShowsSpinner(false);
    }
  };

  const { flex1, inputBoxesView, container, logoStyle, inputButton, errorStyle, font } = styles;

  return (
    <ImageBackground source={BACKGROUND_IMAGE_SOURCE} style={BACKGROUND_STYLE} imageStyle={BACKGROUND_IMAGE_STYLE}>
      <KeyboardAwareScrollView style={flex1}>
        <Loader loading={showsSpinner} />
        <View style={container}>
          <Image source={require('../../assets/images/haydenhallicon.png')} style={logoStyle} />
        </View>
        <View style={inputBoxesView}>
          <Input
            onChangeText={email => {
              setEmail(email);
            }}
            value={email}
            label={t('EMAIL')}
            placeholder="yourname@example.com"
            leftIcon={{ type: 'material-community', name: 'email-outline', color: APP_THEME.APP_LIGHT_FONT_COLOR }}
            errorStyle={errorStyle}
            labelStyle={font}
            inputStyle={font}
            keyboardType="email-address"
            errorMessage={emailError}
          />
          <Input
            onChangeText={password => {
              setPassword(password);
            }}
            value={password}
            label={t('PASSWORD')}
            placeholder="password"
            leftIcon={{ type: 'material-community', name: 'lock-outline', color: APP_THEME.APP_LIGHT_FONT_COLOR }}
            errorStyle={errorStyle}
            labelStyle={font}
            inputStyle={font}
            secureTextEntry
            errorMessage={passwordError}
          />
          <View style={inputButton}>
            <CustomButton title={t('LOGIN')} onPress={() => login()} />
          </View>
        </View>
      </KeyboardAwareScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  logoStyle: { height: 181, width: 181 },
  inputBoxesView: {
    flex: 3,
    width: '90%',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  flex1: {
    flex: 1,
  },
  flex2: {
    flex: 2,
  },
  font: {
    fontFamily: APP_FONTS.FONT_REGULAR,
  },
  inputButton: { width: '40%', alignSelf: 'center', paddingTop: 20 },
  errorStyle: {
    color: APP_THEME.APP_ERROR_COLOR,
    fontFamily: APP_FONTS.FONT_REGULAR,
  },
});
