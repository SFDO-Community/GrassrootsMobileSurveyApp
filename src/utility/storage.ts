import AsyncStorage from '@react-native-community/async-storage';
import Storage from 'react-native-storage';

import { ASYNC_STORAGE_KEYS } from '../constants';

export const initializeStorage = () => {
  global.storage = new Storage({
    size: 1000,
    storageBackend: AsyncStorage,
    defaultExpires: 1000 * 3600 * 24,
    enableCache: true,
  });
};

export const clearStorage = () => {
  for (const k of Object.keys(ASYNC_STORAGE_KEYS)) {
    storage.remove({
      key: ASYNC_STORAGE_KEYS[k],
    });
  }
};
