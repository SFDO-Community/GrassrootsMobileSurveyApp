import React, { useContext } from 'react';
import { Alert, View } from 'react-native';
import { Icon } from 'react-native-elements';

import LocalizationContext from '../context/localizationContext';

import { logout } from '../services/session';
import { fetchSurveysWithTitleFields, uploadSurveyListToSalesforce } from '../services/salesforce/survey';
import { updateSurveyStatusSynced } from '../services/database/localSurvey';

import { notifySuccess, notifyError } from '../utility/notification';
import { logger } from '../utility/logger';

import { APP_THEME } from '../constants';
import { CompositeObjectCreateResultItem, SurveyListItem } from '../types/survey';

type SurveyListRightButtonProps = SyncButtonProps & SettingsButtonProps;

type SyncButtonProps = {
  isNetworkConnected: boolean;
  surveys: Array<SurveyListItem>;
  setShowsSpinner(showsSpinner: boolean): void;
  refreshSurveys(): void;
};

type SettingsButtonProps = {
  navigation: any;
};

export function SurveyListRightButtons(props: SurveyListRightButtonProps) {
  return (
    <View style={{ flexDirection: 'row' }}>
      <SyncButton
        isNetworkConnected={props.isNetworkConnected}
        surveys={props.surveys}
        setShowsSpinner={props.setShowsSpinner}
        refreshSurveys={props.refreshSurveys}
      />
      <SettingsButton navigation={props.navigation} />
    </View>
  );
}

export function SyncButton(props: SyncButtonProps) {
  const { t } = useContext(LocalizationContext);
  const localSurveys = props.surveys.filter(s => s._syncStatus === 'Unsynced');

  const confirmSync = () => {
    Alert.alert(
      t('SYNCING'),
      t('UPLOAD_SURVEY_MESSAGE'),
      [
        {
          text: t('OK'),
          onPress: async () => {
            try {
              props.setShowsSpinner(true);
              const response = await uploadSurveyListToSalesforce(localSurveys);
              logger('DEBUG', 'upload result', response);
              if (
                response.hasErrors === false &&
                response.results &&
                response.results.length > 0 &&
                response.results.length === localSurveys.length
              ) {
                const references: Array<CompositeObjectCreateResultItem> = response.results;
                const localIdToSurveyIdMap: Map<string, string> = new Map(references.map(r => [r.referenceId, r.id]));
                const surveyIdToRefreshedSurveysMap = await fetchSurveysWithTitleFields(references.map(r => r.id));
                const refreshedSurveys = [];
                localIdToSurveyIdMap.forEach((surveyId, _localId) => {
                  refreshedSurveys.push({ _localId, ...surveyIdToRefreshedSurveysMap.get(surveyId) });
                });
                await updateSurveyStatusSynced(refreshedSurveys);
                await props.refreshSurveys();
                notifySuccess('Surveys are successfully uploaded!');
                return;
              } else {
                logger('ERROR', 'Survey Sync', response.results);
                throw new Error('Unexpected error occued while uploading. Contact your adminsitrator.');
              }
            } catch (e) {
              notifyError(e.message);
            } finally {
              props.setShowsSpinner(false);
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
    <Icon
      iconStyle={{ padding: 10 }}
      name="sync"
      size={22}
      color={props.isNetworkConnected ? APP_THEME.APP_BASE_COLOR : APP_THEME.APP_DARK_FONT_COLOR}
      type="material"
      onPress={() => {
        props.isNetworkConnected && confirmSync();
      }}
    />
  );
}

export function LogoutButton(navigation, t) {
  return (
    <Icon
      iconStyle={{ padding: 10 }}
      name="logout"
      size={22}
      color={APP_THEME.APP_BASE_COLOR}
      type="simple-line-icon"
      onPress={() => {
        logout(navigation, t);
      }}
    />
  );
}

export function SettingsButton({ navigation }: SettingsButtonProps) {
  return (
    <Icon
      iconStyle={{ padding: 10 }}
      name="settings"
      size={22}
      color={APP_THEME.APP_BASE_COLOR}
      type="material"
      onPress={() => {
        navigation.navigate('Settings');
      }}
    />
  );
}
