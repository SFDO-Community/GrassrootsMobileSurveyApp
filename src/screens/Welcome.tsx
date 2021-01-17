import React, { useState, useContext } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, ImageBackground, ActivityIndicator } from 'react-native';
import { Input } from 'react-native-elements';

import { getCDWContact, storeContacts } from '../services/api/salesforce/contact';
import { storeOnlineSurveys } from '../services/survey';
import { retrieveAllMetadata } from '../services/describe';
import LocalizationContext from '../context/localizationContext';

import { TextIcon } from '../components';

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

export default function Welcome({ navigation }) {
  const [loading, setLoading] = useState(true);

  const { t } = useContext(LocalizationContext);

  
  /**
   * @description Retrieve contact detail from Salesforce
   */
  const retrieveContactDetail = async () => {
    const areaCode = '';
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

  /*
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
  */

  return (
    <ImageBackground source={BACKGROUND_IMAGE_SOURCE} style={BACKGROUND_STYLE} imageStyle={BACKGROUND_IMAGE_STYLE}>
      <View style={styles.container}>
        <ActivityIndicator animating={loading} size="large" hidesWhenStopped color={APP_THEME.APP_BASE_COLOR} />
        <View>
          <TextIcon icon="check-circle" color="#04844b">Prepare contact records</TextIcon>
          <TextIcon icon="check-circle" color="#04844b">Prepare survey fields and layouts</TextIcon>
          <TextIcon icon="check-circle" color="#04844b">Download online surveys</TextIcon>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
