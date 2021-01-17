import React, { useState, useContext } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, ImageBackground } from 'react-native';
import { Input } from 'react-native-elements';

import { getCDWContact, storeContacts } from '../services/api/salesforce/contact';
import { storeOnlineSurveys } from '../services/survey';
import { retrieveAllMetadata } from '../services/describe';
import LocalizationContext from '../context/localizationContext';

import { CustomButton, Loader } from '../components';

import {
  APP_FONTS,
  APP_THEME,
  ASYNC_STORAGE_KEYS,
  BACKGROUND_IMAGE_SOURCE,
  BACKGROUND_STYLE,
  BACKGROUND_IMAGE_STYLE,
} from '../constants';
import { logger } from '../utility/logger';
import { notifyError } from '../utility/notification';

export default function AreaCode({ navigation }) {
  const [areaCode, setAreaCode] = useState('');
  const [areaCodeError, setAreaCodeError] = useState('');
  const [showsSpinner, setShowsSpinner] = useState(false);

  const { t } = useContext(LocalizationContext);

  /**
   * @description Validate area code. Only empty check here.
   */
  const validateInput = () => {
    if (areaCode.length == 0) {
      setAreaCodeError(t('ENTER_AREA_CODE'));
      throw new Error('Validation error');
    }
    setAreaCodeError(undefined);
  };

  /**
   * @description Retrieve contact detail from Salesforce
   */
  const retrieveContactDetail = async () => {
    const records = await getCDWContact(areaCode);
    if (records && records.length > 0) {
      // TODO: For multiple records?
      const workerContact = records[0];
      storage.save({
        key: ASYNC_STORAGE_KEYS.CDW_WORKED_ID,
        data: workerContact.Id,
      });
      storage.save({
        key: ASYNC_STORAGE_KEYS.AREA_CODE,
        data: areaCode,
      });
      storage.save({
        key: ASYNC_STORAGE_KEYS.CDW_WORKED_NAME,
        data: workerContact.Name,
      });
    } else {
      setTimeout(() => {
        alert(t('AREA_CODE_NOT_FOUND'));
      }, 500);
      // TODO: query error handling
      throw new Error(`Retrieve contact details. ${JSON.stringify(records)}`);
    }
  };

  const { flex1, flex2, inputBoxesView, container, inputButton, font, errorStyle } = styles;
  return (
    <ImageBackground source={BACKGROUND_IMAGE_SOURCE} style={BACKGROUND_STYLE} imageStyle={BACKGROUND_IMAGE_STYLE}>
      <KeyboardAvoidingView style={flex1}>
        <Loader loading={showsSpinner} />
        <View style={container} />
        <View style={inputBoxesView}>
          <Input
            onChangeText={areaCode => {
              setAreaCode(areaCode);
            }}
            value={areaCode}
            label={t('AREA_CODE')}
            labelStyle={font}
            inputStyle={font}
            placeholder="3A2276BB"
            errorStyle={errorStyle}
            errorMessage={areaCodeError}
          />
          <View style={inputButton}>
            <CustomButton
              title={t('GO_TO_SURVEY')}
              onPress={async () => {
                try {
                  validateInput();
                  setShowsSpinner(true);
                  await retrieveContactDetail();
                  await storeContacts();
                  await retrieveAllMetadata();
                  await storeOnlineSurveys();
                  navigation.navigate('SurveyList');
                } catch (error) {
                  logger('ERROR', 'AreaCode', `${error}`);
                  notifyError(JSON.stringify(error));
                } finally {
                  setShowsSpinner(false);
                }
              }}
            />
          </View>
        </View>
        <View style={flex2} />
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  logoStyle: { height: 61, width: 181 },
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
