import Storage from 'react-native-storage';

declare global {
  // eslint-disable-next-line no-var
  var storage: Storage;
}

declare module 'expo-sqlite' {
  interface SQLResultSetRowList {
    length: number;
    item(index: number): any;
    _array: Array<{ [column: string]: any }>;
  }
}
