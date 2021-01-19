import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { APP_THEME, APP_FONTS } from '../constants';

type TextSubHeadingProps = {
  children: React.ReactNode;
};

function TextSubheading({ children }: TextSubHeadingProps) {
  return <Text style={styles.textStyle}>{children}</Text>;
}

const styles = StyleSheet.create({
  textStyle: {
    fontSize: 12,
    fontFamily: APP_FONTS.FONT_REGULAR,
    color: APP_THEME.APP_LIGHT_FONT_COLOR,
    paddingTop: 5,
    paddingBottom: 5,
  },
});

export { TextSubheading };
