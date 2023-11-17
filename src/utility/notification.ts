import Toast from 'react-native-toast-message';

/**
 * Wrapper of react-native-flash-message to avoid redundant code
 */

/**
 * @description Show success message
 */
export const notifySuccess = (description: string) => {
  Toast.show({
    text1: description,
    type: 'success',
  });
};

export const notifySuccessWithParams = params => {
  Toast.show({
    text1: params.title,
    text2: params.description,
    type: 'success',
    position: params.position,
  });
};

/**
 *@description Show error message
 */
export const notifyError = (description: string) => {
  Toast.show({
    text1: 'Error',
    text2: description,
    type: 'error',
    autoHide: false,
  });
};
