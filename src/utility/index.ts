export const validateEmail = email => {
  const emailFormat = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
  if (email.match(emailFormat)) {
    return true;
  }
  return false;
};

/**
 * en_US -> en
 */
export const toShortLocale = (locale: string) => {
  return locale.includes('_') ? locale.split('_')[0] : locale;
};
