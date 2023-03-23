import React from 'react';
import { StyleSheet } from 'react-native';
import { Input } from '@rneui/themed';
import { APP_THEME, APP_FONTS } from '../constants';

type LoginFormInputProps = {
  onChangeText(value: string): void;
  value: string;
  label: string;
  placeholder: string;
  icon: string;
  isSecure?: boolean;
  errorMessage: string;
  keyboardType?: 'email-address' | 'default';
};

function LoginFormInput(props: LoginFormInputProps) {
  return (
    <Input
      onChangeText={value => {
        props.onChangeText(value);
      }}
      value={props.value}
      label={props.label}
      placeholder={props.placeholder}
      leftIcon={{ type: 'material-community', name: props.icon, color: APP_THEME.APP_LIGHT_FONT_COLOR }}
      errorStyle={styles.errorStyle}
      labelStyle={styles.font}
      inputStyle={styles.font}
      keyboardType={props.keyboardType}
      errorMessage={props.errorMessage}
      secureTextEntry={props.isSecure}
    />
  );
}

const styles = StyleSheet.create({
  font: {
    fontFamily: APP_FONTS.FONT_REGULAR,
  },
  errorStyle: {
    color: APP_THEME.APP_ERROR_COLOR,
    fontFamily: APP_FONTS.FONT_REGULAR,
  },
});

export { LoginFormInput };
