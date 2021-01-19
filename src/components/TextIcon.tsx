import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Icon } from 'react-native-elements';
import { APP_FONTS } from '../constants';

type TextIconPropType = {
  icon: string;
  color: string;
  children: React.ReactNode;
};

function TextIcon(props: TextIconPropType) {
  return (
    <View style={styles.container}>
      <Icon iconStyle={{ padding: 10 }} name={props.icon} size={22} color={props.color} type="material" />
      <Text style={styles.textStyle}>{props.children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  textStyle: {
    fontSize: 16,
    lineHeight: 22,
    fontFamily: APP_FONTS.FONT_REGULAR,
  },
});

export { TextIcon };
