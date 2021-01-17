import React from 'react';
import { Icon } from 'react-native-elements';

import { logout } from '../services/session';

import { APP_THEME } from '../constants';

export function BackButton() {
  return (
    <Icon
      iconStyle={{ padding: 10 }}
      name="arrow-back"
      size={22}
      color={APP_THEME.APP_BASE_COLOR}
      type="material"
      onPress={() => {
        console.log('Back to survey page');
        /*
        if (navigation.state.params.isSettingPage) {
          navigation.navigate('SurveyList', { headerTitle: i18n.t('SURVEYS') });
        } else {
          navigation.pop();
        }
        */
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

export function SettingsButton(navigation) {
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
