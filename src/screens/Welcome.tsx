import React, { useState, useContext, useEffect } from 'react';
import { View, StyleSheet, ImageBackground, ActivityIndicator } from 'react-native';

import { getCurrentUserContact, storeContacts } from '../services/salesforce/contact';
import { storeOnlineSurveys } from '../services/survey';
import { retrieveAllMetadata } from '../services/describe';
import { forceLogout } from '../services/session';
import LocalizationContext from '../context/localizationContext';

import { TextIcon } from '../components';

import {
  APP_FONTS,
  APP_THEME,
  BACKGROUND_IMAGE_SOURCE,
  BACKGROUND_STYLE,
  BACKGROUND_IMAGE_STYLE,
  ASYNC_STORAGE_KEYS,
} from '../constants';
import { logger } from '../utility/logger';
import { notifyError } from '../utility/notification';

export default function Welcome({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [contactIconColor, setContactIconColor] = useState(APP_THEME.APP_LIGHT_FONT_COLOR);
  const [surveyMetaIconColor, setSurveyMetaIconColor] = useState(APP_THEME.APP_LIGHT_FONT_COLOR);
  const [surveyRecordsIconColor, setSurveyRecordsIconColor] = useState(APP_THEME.APP_LIGHT_FONT_COLOR);

  const { t } = useContext(LocalizationContext);

  /**
   * @description Retrieve contact detail from Salesforce
   */
  useEffect(() => {
    if (!loading) {
      navigation.navigate('SurveyList');
    } else {
      const prepare = async () => {
        try {
          const userContact = await getCurrentUserContact();
          storage.save({ key: ASYNC_STORAGE_KEYS.USER_CONTACT_ID, data: userContact.Id });
          await storeContacts();
          setContactIconColor(APP_THEME.APP_SUCCESS_COLOR);

          await retrieveAllMetadata();
          setSurveyMetaIconColor(APP_THEME.APP_SUCCESS_COLOR);

          await storeOnlineSurveys();
          setSurveyRecordsIconColor(APP_THEME.APP_SUCCESS_COLOR);
        } catch (error) {
          logger('ERROR', 'Welcome', `${error}`);
          notifyError(error.message);
          await forceLogout(navigation);
        } finally {
          setLoading(false);
        }
      };
      prepare();
    }
  }, [loading]);

  return (
    <ImageBackground source={BACKGROUND_IMAGE_SOURCE} style={BACKGROUND_STYLE} imageStyle={BACKGROUND_IMAGE_STYLE}>
      <View style={styles.container}>
        <ActivityIndicator animating={loading} size="large" hidesWhenStopped color={APP_THEME.APP_BASE_COLOR} />
        <View>
          <TextIcon icon="check-circle" color={contactIconColor}>
            Prepare contact records
          </TextIcon>
          <TextIcon icon="check-circle" color={surveyMetaIconColor}>
            Prepare survey settings
          </TextIcon>
          <TextIcon icon="check-circle" color={surveyRecordsIconColor}>
            Download online surveys
          </TextIcon>
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
