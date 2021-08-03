import enDictionary from '../src/config/locale/en_US.json';

export const translate = key => {
  return enDictionary[key];
};
