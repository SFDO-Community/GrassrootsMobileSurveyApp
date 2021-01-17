import React, { useContext } from 'react';
import { View, StyleSheet, Alert, TextInput } from 'react-native';
import { Button } from 'react-native-elements';

import LocalizationContext from '../context/localizationContext';
import { uploadSurveyListToSalesforce, updateSurveyStatusSynced } from '../services/survey';
import { notifySuccess, notifyError } from '../utility/notification';
import { APP_FONTS, APP_THEME } from '../constants';
import { SurveyListItem } from '../types/survey';
import { logger } from '../utility/logger';

type SurveyListHeaderProps = {
  isNetworkConnected: boolean;
  surveys: Array<SurveyListItem>;
  setShowsSpinner(showsSpinner: boolean): void;
  refreshSurveys(): void;
};

export default function SurveyListHeader(props: SurveyListHeaderProps) {
  const { t } = useContext(LocalizationContext);
  const localSurveys = props.surveys.filter(s => s.syncStatus === 'Unsynced');

  const confirmSync = () => {
    Alert.alert(
      t('SYNCING'),
      t('UPLOAD_SURVEY_MESSAGE'),
      [
        {
          text: t('OK'),
          onPress: async () => {
            props.setShowsSpinner(true);
            const response = await uploadSurveyListToSalesforce(localSurveys);
            logger('DEBUG', 'upload result', response);
            if (
              response.hasErrors === false &&
              response.results &&
              response.results.length > 0 &&
              response.results.length === localSurveys.length
            ) {
              await updateSurveyStatusSynced(localSurveys);
              await props.refreshSurveys();
              props.setShowsSpinner(false);
              notifySuccess('Surveys are successfully uploaded!');
              return;
            } else {
              props.setShowsSpinner(false);
              notifyError('Unexpected error occued while uploading. Contact your adminsitrator.');
            }
          },
        },
        {
          text: t('CANCEL'),
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.pendingSurveyContainer}>
      <TextInput
        underlineColorAndroid="transparent"
        placeholder={t('SEARCH_SURVEYS')}
        style={styles.textStylePendingSurvey}
        value={`${localSurveys.length} - ${t('QUEUED_FOR_SYNC')}`} // dirtySurveyCount
        editable={false}
      />
      <View style={styles.syncIconStyle}>
        <Button
          containerStyle={styles.syncButtonContainer}
          titleStyle={
            props.isNetworkConnected
              ? {
                  color: APP_THEME.APP_WHITE,
                  fontFamily: APP_FONTS.FONT_REGULAR,
                }
              : {
                  color: APP_THEME.APP_DARK_FONT_COLOR,
                  fontFamily: APP_FONTS.FONT_REGULAR,
                }
          }
          buttonStyle={
            props.isNetworkConnected
              ? { backgroundColor: APP_THEME.APP_BASE_COLOR }
              : { backgroundColor: APP_THEME.APP_BORDER_COLOR }
          }
          onPress={() => {
            props.isNetworkConnected && confirmSync();
          }}
          title="Sync"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  textStylePendingSurvey: {
    padding: 10,
    fontSize: 14,
    fontFamily: APP_FONTS.FONT_REGULAR,
    flex: 8,
    backgroundColor: 'white',
    borderColor: APP_THEME.APP_BORDER_COLOR,
    borderWidth: 1,
    borderTopLeftRadius: 2,
    borderBottomLeftRadius: 2,
  },
  pendingSurveyContainer: {
    minHeight: 50,
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 5,
    paddingBottom: 5,
  },
  syncIconStyle: {
    padding: 8,
    position: 'absolute',
    right: 10,
  },
  syncButtonContainer: {
    minWidth: 80,
  },
});
