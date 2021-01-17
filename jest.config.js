module.exports = {
  globals: {
    __DEV__: true,
  },
  preset: 'jest-expo',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json', 'jsx', 'node'],
  setupFiles: ['./node_modules/react-native-gesture-handler/jestSetup.js'],
  testEnvironment: 'jsdom',
};
