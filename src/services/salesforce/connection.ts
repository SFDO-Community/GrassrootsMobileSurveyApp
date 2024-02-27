import * as SecureStore from 'expo-secure-store';

import { authenticate, LoginResponse } from '../auth';
import { SECURE_STORE_KEYS } from '../../constants';
import { logger } from '../../utility/logger';

import { RequestParam } from '../../types/connection';

/**
 * @description Call Salesforce REST endpoint using fetch() API. Retry with a refreshed access token if expired.
 * @param endPoint Request endpoint (Salesforce REST API resource)
 * @param method Request method (GET, POST)
 * @param body Request body. Make sure the object is serialized
 */
export const fetchRetriable = async (param: RequestParam) => {
  const accessToken = await SecureStore.getItemAsync(SECURE_STORE_KEYS.ACCESS_TOKEN);
  const response = await fetch(param.endPoint, {
    method: param.method,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      ...param.headers,
    },
    body: param.body,
  });
  if (response.status === 401) {
    logger('DEBUG', 'fetchRetriable', 'refreshing access token');
    const email = await SecureStore.getItemAsync(SECURE_STORE_KEYS.EMAIL);
    const password = await SecureStore.getItemAsync(SECURE_STORE_KEYS.PASSWORD);
    const refreshResponse: LoginResponse = await authenticate(email, password);
    const secondResponse = await fetch(param.endPoint, {
      method: param.method,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${refreshResponse.access_token}`,
      },
      body: param.body,
    });
    return await secondResponse.json();
  }
  return await response.json();
};
