import React from 'react';
import { StyleSheet, View, Modal, ActivityIndicator, Text } from 'react-native';
import { APP_THEME, APP_FONTS } from '../constants';

type LoaderProps = {
  loading: boolean;
  message?: string;
};

function Loader(props: LoaderProps) {
  const { loading, message } = props;
  return (
    <Modal transparent visible={loading}>
      <View style={styles.modalBackground}>
        <ActivityIndicator animating={loading} size="large" hidesWhenStopped color={APP_THEME.APP_BASE_COLOR} />
        <Text style={styles.loadingTitleStyle}> {message} </Text>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: APP_THEME.APP_WHITE,
    alignItems: 'center',
    opacity: 0.8,
  },
  loadingTitleStyle: {
    fontFamily: APP_FONTS.FONT_REGULAR,
    fontSize: 36,
    color: APP_THEME.APP_BASE_COLOR,
    paddingTop: 10,
  },
});

export { Loader };
