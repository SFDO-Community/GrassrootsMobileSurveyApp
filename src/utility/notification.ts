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
      props: {},
    },
    backgroundColor: APP_THEME.APP_SUCCESS_COLOR,
    duration: 3000,
  });
};

export const notifySuccessWithParams = params => {
  showMessage({
    message: params.title,
    description: params.description,
    type: 'success',
    icon: {
      icon: 'success',
      position: 'left',
      props: {},
    },
    backgroundColor: APP_THEME.APP_SUCCESS_COLOR,
    duration: 3000,
    position: params.position,
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
      props: {},
    },
    autoHide: false,
    backgroundColor: APP_THEME.APP_ERROR_COLOR,
  });
};
