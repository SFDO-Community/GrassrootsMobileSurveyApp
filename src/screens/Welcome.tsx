import React, { useState, useContext, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import Modal from 'react-native-modal';

import { getCurrentUserContact, storeContacts } from '../services/salesforce/contact';
import { storeOnlineSurveys } from '../services/salesforce/survey';
import { retrieveAllMetadata } from '../services/describe';
import { clearLocal } from '../services/session';
import LocalizationContext from '../context/localizationContext';

import { TextIcon } from '../components';

import { APP_THEME, ASYNC_STORAGE_KEYS } from '../constants';
import { logger } from '../utility/logger';
import { notifyError } from '../utility/notification';

type WelcomeModalProps = {
  isVisible: boolean;
  setVisible(isVisible: boolean): void;
  navigation: any;
};

export default function Welcome({ isVisible, setVisible, navigation }: WelcomeModalProps) {
  const [loading, setLoading] = useState(true);
  const [contactIconColor, setContactIconColor] = useState(APP_THEME.APP_LIGHT_FONT_COLOR);
  const [surveyMetaIconColor, setSurveyMetaIconColor] = useState(APP_THEME.APP_LIGHT_FONT_COLOR);
  const [surveyRecordsIconColor, setSurveyRecordsIconColor] = useState(APP_THEME.APP_LIGHT_FONT_COLOR);

  const { t } = useContext(LocalizationContext);

  const initialize = () => {
    setVisible(false);
    setLoading(true);
    setContactIconColor(APP_THEME.APP_LIGHT_FONT_COLOR);
    setSurveyMetaIconColor(APP_THEME.APP_LIGHT_FONT_COLOR);
    setSurveyRecordsIconColor(APP_THEME.APP_LIGHT_FONT_COLOR);
  };

  /**
   * @description Retrieve contact detail from Salesforce
   */
  useEffect(() => {
    // Only load data when modal shows
    if (!isVisible) {
      return;
    }
    // Navigates to survey list after loaded
    if (!loading) {
      setTimeout(() => {
        initialize();
        navigation.navigate('SurveyList');
      }, 1000);
      // Fetch records
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
          setLoading(false);
        } catch (error) {
          logger('ERROR', 'Welcome', `${error}`);
          notifyError(error.message);
          await clearLocal();
          setVisible(false);
        }
      };
      prepare();
    }
  }, [isVisible, loading]);

  return (
    <Modal isVisible={isVisible}>
      <View style={styles.container}>
        <ActivityIndicator animating={loading} hidesWhenStopped={false} size="large" color={APP_THEME.APP_BASE_COLOR} />
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
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingTop: 30,
  },
});
