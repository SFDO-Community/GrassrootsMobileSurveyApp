import { Alert } from 'react-native';

import { clearDatabase } from './database/database';
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

export const clearLocal = async () => {
  clearStorage();
  await clearDatabase();
};

export const forceLogout = async navigation => {
  await clearLocal();
  navigation.navigate('Login');
};
