import React from 'react';
import { Icon } from '@rneui/themed';
import { StackNavigationProp } from '@react-navigation/stack';

import { APP_THEME } from '../constants';

import { StackParamList } from '../Router';
type LoginScreenNavigationProp = StackNavigationProp<StackParamList, 'SurveyEditor'>;

type LoginSettingsButtonProps = {
  navigation: LoginScreenNavigationProp;
};

export function LoginSettingsButton(props: LoginSettingsButtonProps) {
  return (
    <Icon
      accessibilityRole="button"
      accessible
      iconStyle={{ padding: 10 }}
      name="settings"
      size={22}
      color={APP_THEME.APP_BASE_COLOR}
      type="material"
      onPress={() => {
        props.navigation.navigate('LoginSettings');
      }}
    />
  );
}
