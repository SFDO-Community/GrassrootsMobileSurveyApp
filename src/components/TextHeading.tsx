import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { APP_THEME, APP_FONTS } from '../constants';

type TextHeadingProps = {
  children: any;
};

function TextHeading({ children }: TextHeadingProps) {
  return <Text style={styles.textStyle}>{children}</Text>;
}

const styles = StyleSheet.create({
  textStyle: {
    fontSize: 16,
    lineHeight: 22,
    fontFamily: APP_FONTS.FONT_REGULAR,
    color: APP_THEME.APP_DARK_FONT_COLOR,
    paddingTop: 5,
    paddingBottom: 5,
  },
});

export { TextHeading };
