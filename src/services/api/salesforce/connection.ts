import * as SecureStore from 'expo-secure-store';

import { authenticate, LoginResponse } from '../../auth';
import { ASYNC_STORAGE_KEYS } from '../../../constants';
import { logger } from '../../../utility/logger';

/**
 * @description Call Salesforce REST endpoint using fetch() API. Retry with a refreshed access token if expired.
 * @param endPoint Request endpoint (Salesfore REST API resource)
 * @param method Request method (GET, POST)
 * @param body Request mody. Make sure the object is serialized
 */
export const fetchRetriable = async (endPoint: string, method: string, body: string) => {
  const accessToken = await storage.load({
    key: ASYNC_STORAGE_KEYS.SALESFORCE_ACCESS_TOKEN,
  });
  const response = await fetch(endPoint, {
    method,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body,
  });
  if (response.status === 401) {
    logger('DEBUG', 'fetchRetriable', 'refreshing access token');
    const email = await SecureStore.getItemAsync('email');
    const password = await SecureStore.getItemAsync('password');
    const refreshResponse: LoginResponse = await authenticate(email, password);
    const secondResponse = await fetch(endPoint, {
      method,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${refreshResponse.access_token}`,
      },
      body,
    });
    return await secondResponse.json();
  }
  return await response.json();
};
