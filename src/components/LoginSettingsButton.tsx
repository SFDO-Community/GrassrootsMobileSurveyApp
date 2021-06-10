import React from 'react';
import { Icon } from 'react-native-elements';
import { APP_THEME } from '../constants';

export function LoginSettingsButton(navigation) {
  return (
    <Icon
      iconStyle={{ padding: 10 }}
      name="settings"
      size={22}
      color={APP_THEME.APP_BASE_COLOR}
      type="material"
      onPress={() => {
        navigation.navigate('LoginSettings');
      }}
    />
  );
}
