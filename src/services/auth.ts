/* eslint-disable @typescript-eslint/camelcase */
import * as SecureStore from 'expo-secure-store';

import { ASYNC_STORAGE_KEYS, SECURE_STORE_KEYS } from '../constants';
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
      const herokuAppName = await SecureStore.getItemAsync(SECURE_STORE_KEYS.HEROKU_APP_NAME);
      const loginApiUrl = `https://${herokuAppName}.herokuapp.com`;
      logger('DEBUG', 'services | auth | loginUrl', loginApiUrl);
      const response = await fetch(`${loginApiUrl}/login`, {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok || response.status === 404) {
        resolve({
          success: false,
          error_description: 'Unexpected server error. Make sure the Heroku app name is correct.',
        });
      }
      const success = response.ok;
      const responseJson = await response.json();
      const result: LoginResponse = { success, ...responseJson };
      await saveToken(result);
      resolve(result);
    } catch (error) {
      if (error.message === 'Network request failed') {
        resolve({
          success: false,
          error_description: 'Network error. Make sure the Heroku app name is correct.',
        });
      }
      console.log(error);
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
