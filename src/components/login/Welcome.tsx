import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import Modal from 'react-native-modal';

import { getCurrentFieldWorker, storeContacts } from '../../services/salesforce/contact';
import { storeOnlineSurveys } from '../../services/salesforce/survey';
import { retrieveAllMetadata } from '../../services/describe';
import { clearLocal } from '../../services/session';
import { useLocalizationContext } from '../../context/localizationContext';
import { useAuthContext } from '../../context/authContext';
import { storeAvailableLanguages } from '../../services/database/localization';

import { TextIcon } from '..';

import { APP_THEME, ASYNC_STORAGE_KEYS } from '../../constants';
import { logger } from '../../utility/logger';
import { notifyError } from '../../utility/notification';

type WelcomeModalProps = {
  isVisible: boolean;
  setVisible(isVisible: boolean): void;
};

export default function Welcome({ isVisible, setVisible }: WelcomeModalProps) {
  const [loading, setLoading] = useState(true);
  const [contactIconColor, setContactIconColor] = useState(APP_THEME.APP_LIGHT_FONT_COLOR);
  const [surveyMetaIconColor, setSurveyMetaIconColor] = useState(APP_THEME.APP_LIGHT_FONT_COLOR);
  const [surveyRecordsIconColor, setSurveyRecordsIconColor] = useState(APP_THEME.APP_LIGHT_FONT_COLOR);

  const { t } = useLocalizationContext();
  const authContext = useAuthContext();
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
        authContext.login();
      }, 1000);
      // Fetch records
    } else {
      const prepare = async () => {
        try {
          const fieldWorker = await getCurrentFieldWorker();
          storage.save({ key: ASYNC_STORAGE_KEYS.FIELD_WORKER_CONTACT_ID, data: fieldWorker.Id });
          await storeContacts();
          setContactIconColor(APP_THEME.APP_SUCCESS_COLOR);

          await storeAvailableLanguages();
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
    <Modal isVisible={isVisible} testID="modal">
      <View style={styles.container}>
        <ActivityIndicator animating={loading} hidesWhenStopped={false} size="large" color={APP_THEME.APP_BASE_COLOR} />
        <View>
          <TextIcon icon="check-circle" color={contactIconColor}>
            {t('WELCOME_LOADING_CONTACT')}
          </TextIcon>
          <TextIcon icon="check-circle" color={surveyMetaIconColor}>
            {t('WELCOME_LOADING_METADATA')}
          </TextIcon>
          <TextIcon icon="check-circle" color={surveyRecordsIconColor}>
            {t('WELCOME_LOADING_SURVEY')}
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
    backgroundColor: APP_THEME.APP_WHITE,
    paddingTop: 30,
  },
});
