import { showMessage } from 'react-native-flash-message';
import { APP_THEME } from '../constants';

/**
 * Wrapper of react-native-flash-message to avoid redundant code
 */

/**
 * @description Show success message
 */
export const notifySuccess = (description: string) => {
  showMessage({
    message: 'Success',
    description,
    type: 'success',
    icon: {
      icon: 'success',
      position: 'left',
    },
    backgroundColor: APP_THEME.APP_SUCCESS_COLOR,
    duration: 3000,
  });
};

/**
 *@description Show error message
 */
export const notifyError = (description: string) => {
  showMessage({
    message: 'Error',
    description,
    type: 'danger',
    icon: {
      icon: 'danger',
      position: 'left',
    },
    autoHide: false,
    backgroundColor: APP_THEME.APP_ERROR_COLOR,
  });
};
