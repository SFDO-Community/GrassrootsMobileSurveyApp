import { ASYNC_STORAGE_KEYS } from '../../constants';
import { LOGIN_API_URL, REFRESH_KEY } from '@env';
import { logger } from '../../utility/logger';

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
      saveToken(result);
      resolve(result);
    } catch (error) {
      logger('ERROR', 'services | auth', error);
      reject(error);
    }
  });
};

const saveToken = (result: LoginResponse) => {
  if (result.success) {
    storage.save({
      key: ASYNC_STORAGE_KEYS.SALESFORCE_ACCESS_TOKEN,
      data: result.access_token,
    });
    storage.save({
      key: ASYNC_STORAGE_KEYS.SALESFORCE_INSTANCE_URL,
      data: result.instance_url,
    });
  }
};
