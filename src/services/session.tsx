import { Alert } from 'react-native';

import { clearDatabase } from './database/database';
import { clearStorage } from '../utility/storage';

export const logout = (t, authContext) => {
  return Alert.alert(
    t('LOGOUT'),
    t('LOGOUT_MESSAGE'),
    [
      {
        text: t('OK'),
        onPress: async () => {
          clearStorage();
          await clearDatabase();
          authContext.logout();
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

export const forceLogout = async authContext => {
  await clearLocal();
  authContext.logout();
};
