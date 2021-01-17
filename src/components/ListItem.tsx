import React from 'react';
import { View, TouchableHighlight, StyleSheet } from 'react-native';
import { TextHeading } from './TextHeading';
import { TextSubheading } from './TextSubheading';
import { APP_THEME } from '../constants';

interface ListItemProps {
  title: string;
  subtitle?: string;
  onPress(): void;
  showCaret?: boolean;
}

export default function ListItem(props: ListItemProps) {
  return (
    <TouchableHighlight style={styles.row} onPress={props.onPress} underlayColor={'#EEEEEE'}>
      <View style={styles.innerContainer}>
        <TextHeading>{props.title}</TextHeading>
        {props.subtitle && <TextSubheading>{props.subtitle}</TextSubheading>}
        {props.showCaret && <View style={styles.triangleCorner} />}
      </View>
    </TouchableHighlight>
  );
}

const styles = StyleSheet.create({
  innerContainer: {
    marginLeft: 20,
    flex: 1,
    justifyContent: 'space-around',
  },
  row: {
    minHeight: 44,
    backgroundColor: '#FFF',
  },
  triangleCorner: {
    width: 0,
    height: 0,
    position: 'absolute',
    right: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderRightWidth: 15,
    borderTopWidth: 15,
    borderRadius: 3,
    borderRightColor: 'transparent',
    borderTopColor: APP_THEME.APP_BASE_COLOR,
    transform: [{ rotate: '90deg' }],
  },
});

export { ListItem };
