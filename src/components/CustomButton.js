import React, { PureComponent } from 'react';
import { StyleSheet } from 'react-native';
import { Button } from 'react-native-elements';
import { APP_THEME, APP_FONTS } from '../constants';

const styles = StyleSheet.create({
  background: {
    backgroundColor: APP_THEME.APP_BASE_FONT_COLOR,
    borderRadius: 5
  },
  buttonText: {
    fontSize: 16,
    fontFamily: APP_FONTS.FONT_REGULAR
  }
});

class CustomButton extends PureComponent {
  render() {
    const { title, onPress } = this.props;
    return (
      <Button
        onPress={onPress}
        buttonStyle={styles.background}
        titleStyle={styles.buttonText}
        title={title}
      />
    );
  }
}

export { CustomButton };
