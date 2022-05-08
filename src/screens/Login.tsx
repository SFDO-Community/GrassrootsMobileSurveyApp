import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, Image, ImageBackground } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Button } from 'react-native-elements';
import * as SecureStore from 'expo-secure-store';

import Welcome from './Welcome';
import { Loader, LoginFormInput } from '../components';

import { validateEmail } from '../utility';
import {
  ASYNC_STORAGE_KEYS,
  BACKGROUND_IMAGE_SOURCE,
  BACKGROUND_STYLE,
  BACKGROUND_IMAGE_STYLE,
  APP_FONTS,
  APP_THEME,
  SECURE_STORE_KEYS,
} from '../constants';
import LocalizationContext from '../context/localizationContext';

import { authenticate } from '../services/auth';
import { notifyError } from '../utility/notification';

export default function Login({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showsSpinner, setShowsSpinner] = useState(false);
  const [showsWelcomeModal, setShowsWelcomeModal] = useState(false);

  const { t } = useContext(LocalizationContext);

  useEffect(() => {
    const prepare = async () => {
      try {
        const email = await SecureStore.getItemAsync(SECURE_STORE_KEYS.EMAIL);
        if (email) {
          setEmail(email);
        }
        const fieldWorkerContactId = await storage.load({ key: ASYNC_STORAGE_KEYS.FIELD_WORKER_CONTACT_ID });
        if (fieldWorkerContactId) {
          navigation.navgigate('SurveyList');
        }
      } catch {}
    };
    prepare();
  }, []);

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
      if (loginResponse.success) {
        await SecureStore.setItemAsync(SECURE_STORE_KEYS.EMAIL, email);
        await SecureStore.setItemAsync(SECURE_STORE_KEYS.PASSWORD, password);
        setShowsWelcomeModal(true);
      } else {
        notifyError(loginResponse.error_description);
      }
    } catch (error) {
      notifyError(error.message);
    } finally {
      setShowsSpinner(false);
    }
  };

  return (
    <ImageBackground source={BACKGROUND_IMAGE_SOURCE} style={BACKGROUND_STYLE} imageStyle={BACKGROUND_IMAGE_STYLE}>
      <KeyboardAwareScrollView style={styles.flex1}>
        <Loader loading={showsSpinner} />
        <View style={styles.container}>
          <Image source={require('../../assets/images/icon.png')} style={styles.logoStyle} />
        </View>
        <View style={styles.inputBoxesView}>
          <LoginFormInput
            onChangeText={value => setEmail(value)}
            value={email}
            label={t('EMAIL')}
            placeholder="yourname@example.com"
            icon="email-outline"
            keyboardType="email-address"
            errorMessage={emailError}
          />
          <LoginFormInput
            onChangeText={value => setPassword(value)}
            value={password}
            label={t('PASSWORD')}
            placeholder="password"
            icon="lock-outline"
            isSecure
            errorMessage={passwordError}
          />
          <View style={styles.loginButtonContainer}>
            <Button
              title={t('LOGIN')}
              onPress={() => login()}
              buttonStyle={styles.loginButtonBackground}
              titleStyle={styles.loginButtonText}
            />
          </View>
        </View>
      </KeyboardAwareScrollView>
      <Welcome isVisible={showsWelcomeModal} setVisible={setShowsWelcomeModal} navigation={navigation} />
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
  flex1: {
    flex: 1,
  },
  logoStyle: { height: 200, width: 200 },
  inputBoxesView: {
    flex: 3,
    width: '90%',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  loginButtonContainer: { width: '40%', alignSelf: 'center', paddingTop: 20 },
  loginButtonBackground: {
    backgroundColor: APP_THEME.APP_BASE_FONT_COLOR,
    borderRadius: 5,
  },
  loginButtonText: {
    fontSize: 16,
    fontFamily: APP_FONTS.FONT_REGULAR,
  },
});
