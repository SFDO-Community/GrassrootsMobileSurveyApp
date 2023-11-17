import React from 'react';
import { BaseToast, ErrorToast } from 'react-native-toast-message';
import { APP_THEME } from '../constants';

/**
 * @description Toast config using SLDS color
 */
export const toastConfig = {
  /*
    Overwrite 'success' type,
    by modifying the existing `BaseToast` component
  */
  success: props => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: APP_THEME.APP_SUCCESS_COLOR }}
      text1Style={{
        fontSize: 15,
      }}
      text2Style={{
        fontSize: 12,
      }}
    />
  ),
  /*
    Overwrite 'error' type,
    by modifying the existing `ErrorToast` component
  */
  error: props => (
    <ErrorToast
      {...props}
      style={{ borderLeftColor: APP_THEME.APP_ERROR_COLOR }}
      text1Style={{
        fontSize: 15,
      }}
      text2Style={{
        fontSize: 12,
      }}
    />
  ),
};
