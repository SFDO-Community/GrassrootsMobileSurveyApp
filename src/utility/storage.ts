import AsyncStorage from '@react-native-async-storage/async-storage';
import Storage from 'react-native-storage';

import { ASYNC_STORAGE_KEYS } from '../constants';

export const initializeStorage = () => {
  if (!global.storage) {
    global.storage = new Storage({
      size: 1000,
      storageBackend: AsyncStorage,
      defaultExpires: null,
      enableCache: true,
    });
  }
};

export const clearStorage = () => {
  for (const k of Object.keys(ASYNC_STORAGE_KEYS)) {
    storage.remove({
      key: ASYNC_STORAGE_KEYS[k],
    });
  }
};
