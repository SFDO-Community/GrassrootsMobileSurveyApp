import { showMessage } from 'react-native-flash-message';
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
    backgroundColor: '#04844b',
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
    duration: 4500,
    backgroundColor: '#c23934',
  });
};
