import React from 'react';
import { StyleSheet } from 'react-native';
import { Input } from 'react-native-elements';
import { APP_THEME, APP_FONTS } from '../../constants';

type TextInputPropType = {
  title: string;
  value: string;
  onValueChange(value: string): void;
  keyboardType?: 'default' | 'numeric' | 'phone-pad';
  multiline?: boolean;
  disabled?: boolean;
};

function TextInput(props: TextInputPropType) {
  // textField = null;
  const { onValueChange, value, title, keyboardType, multiline, disabled } = props;
  const { containerStyle, inputContainerStyle, labelStyle, inputStyle, inputStyleMultiline } = styles;

  return (
    <Input
      editable={!disabled}
      // ref={ref => (this.textField = ref)}
      multiline={multiline ? multiline : false}
      numberOfLines={multiline ? 4 : 1}
      value={value}
      label={title}
      autoCapitalize="none"
      onChangeText={onValueChange}
      keyboardType={keyboardType ? keyboardType : 'default'}
      containerStyle={containerStyle}
      inputContainerStyle={inputContainerStyle}
      labelStyle={labelStyle}
      inputStyle={multiline ? inputStyleMultiline : inputStyle}
      renderErrorMessage={false}
    />
  );
}

const styles = StyleSheet.create({
  inputContainerStyle: {
    paddingLeft: 10,
    borderWidth: 1,
    borderRadius: 4,
    borderColor: APP_THEME.APP_BORDER_COLOR,
  },
  labelStyle: {
    marginBottom: 5,
    fontSize: 14,
    color: APP_THEME.APP_LIGHT_FONT_COLOR,
    fontFamily: APP_FONTS.FONT_BOLD,
  },
  inputStyle: {
    fontSize: 16,
    fontFamily: APP_FONTS.FONT_REGULAR,
  },
  inputStyleMultiline: {
    fontSize: 16,
    fontFamily: APP_FONTS.FONT_REGULAR,
    height: 100,
  },
  containerStyle: { padding: 10 },
});

export { TextInput };
