import * as SecureStore from 'expo-secure-store';

import { ASYNC_STORAGE_KEYS, SECURE_STORE_KEYS } from '../constants';
import { LOGIN_API_URL } from '@env';
import { logger } from '../utility/logger';

export interface LoginResponse {
  success: boolean;
  access_token?: string;
  instance_url?: string;
  error?: string;
  error_description?: string;
}

export const authenticate = async (email: string, password: string): Promise<LoginResponse> => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await fetch(`${LOGIN_API_URL}/login`, {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const success = response.ok;
      const responseJson = await response.json();
      const result: LoginResponse = { success, ...responseJson };
      await saveToken(result);
      resolve(result);
    } catch (error) {
      logger('ERROR', 'services | auth', error);
      reject(error);
    }
  });
};

const saveToken = async (result: LoginResponse) => {
  if (result.success) {
    await SecureStore.setItemAsync(SECURE_STORE_KEYS.ACCESS_TOKEN, result.access_token);

    storage.save({
      key: ASYNC_STORAGE_KEYS.SALESFORCE_INSTANCE_URL,
      data: result.instance_url,
    });
  }
};
