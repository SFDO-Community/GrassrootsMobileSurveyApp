import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { APP_THEME, APP_FONTS } from '../constants';

const styles = StyleSheet.create({
  textStyle: {
    fontSize: 12,
    fontFamily: APP_FONTS.FONT_REGULAR,
    color: APP_THEME.APP_LIGHT_FONT_COLOR,
    paddingTop: 5,
    paddingBottom: 5
  }
});

const TextSubheading = ({ children }) => {
  return <Text style={styles.textStyle}>{children}</Text>;
};

export { TextSubheading };
