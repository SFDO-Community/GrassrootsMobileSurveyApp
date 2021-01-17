import { Alert } from 'react-native';

import { clearDatabase } from './database';
import { clearStorage } from '../utility/storage';

export const logout = (navigation, t) => {
  Alert.alert(
    t('LOGOUT'),
    t('LOGOUT_MESSAGE'),
    [
      {
        text: t('OK'),
        onPress: async () => {
          clearStorage();
          await clearDatabase();
          navigation.navigate('Login');
        },
      },
      {
        text: t('CANCEL'),
      },
    ],
    { cancelable: true }
  );
};

export const forceLogout = async navigation => {
  clearStorage();
  await clearDatabase();
  navigation.navigate('Login');
};
