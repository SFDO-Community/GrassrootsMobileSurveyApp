import React, { useState, useEffect, useContext } from 'react';
import { Text, View, StyleSheet, ImageBackground } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Icon, Input, Button } from 'react-native-elements';
import * as SecureStore from 'expo-secure-store';

import {
  BACKGROUND_IMAGE_SOURCE,
  BACKGROUND_STYLE,
  BACKGROUND_IMAGE_STYLE,
  APP_FONTS,
  APP_THEME,
  SECURE_STORE_KEYS,
} from '../constants';
import LocalizationContext from '../context/localizationContext';
import { notifySuccess } from '../utility/notification';

export default function LoginSettings({ navigation }) {
  const [herokuAppName, setHerokuAppName] = useState('');

  const { t } = useContext(LocalizationContext);

  useEffect(() => {
    const prepare = async () => {
      const storedHerokuAppName = (await SecureStore.getItemAsync(SECURE_STORE_KEYS.HEROKU_APP_NAME)) || '';
      setHerokuAppName(storedHerokuAppName);
    };
    prepare();
  }, []);

  /**
   * @description Save Heroku app name.
   */
  const save = async () => {
    await SecureStore.setItemAsync(SECURE_STORE_KEYS.HEROKU_APP_NAME, herokuAppName);
    notifySuccess('Successfully saved!');
  };

  return (
    <ImageBackground source={BACKGROUND_IMAGE_SOURCE} style={BACKGROUND_STYLE} imageStyle={BACKGROUND_IMAGE_STYLE}>
      <KeyboardAwareScrollView style={styles.flex1}>
        <View style={styles.inputBoxesView}>
          <Input
            onChangeText={value => setHerokuAppName(value)}
            value={herokuAppName}
            label={t('HEROKU_APP_NAME')}
            labelStyle={{ fontFamily: APP_FONTS.FONT_REGULAR }}
            inputStyle={{ fontFamily: APP_FONTS.FONT_REGULAR }}
            placeholder="aaa-bbb-12345"
            keyboardType="url"
          />
          <View style={styles.descriptionStyle}>
            <Icon name="information" type="material-community" color={APP_THEME.APP_DARK_FONT_COLOR} />
            <Text style={{ fontFamily: APP_FONTS.FONT_REGULAR, color: APP_THEME.APP_DARK_FONT_COLOR, paddingLeft: 5 }}>
              {t('HEROKU_APP_NAME_DESCRIPTION')}
            </Text>
          </View>
          <View style={styles.saveButtonContainer}>
            <Button
              title={t('SAVE')}
              onPress={() => save()}
              buttonStyle={styles.saveButtonBackground}
              titleStyle={styles.saveButtonText}
              disabled={!herokuAppName}
            />
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
  flex1: {
    flex: 1,
  },
  inputBoxesView: {
    width: '90%',
    paddingTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  descriptionStyle: {
    paddingLeft: 10,
    paddingRight: 10,
    flexDirection: 'row',
  },
  saveButtonContainer: { width: '40%', alignSelf: 'center', paddingTop: 20 },
  saveButtonBackground: {
    backgroundColor: APP_THEME.APP_BASE_FONT_COLOR,
    borderRadius: 5,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: APP_FONTS.FONT_REGULAR,
  },
});
