module.exports = {
  globals: {
    __DEV__: true,
  },
  preset: 'jest-expo',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json', 'jsx', 'node'],
  setupFiles: ['./node_modules/react-native-gesture-handler/jestSetup.js', '<rootDir>/jest.setup.js'],
  setupFilesAfterEnv: ['./node_modules/@testing-library/jest-native/extend-expect.js', '<rootDir>/jest.env.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native|react-clone-referenced-element|@react-native-community|@rneui|expo(nent)?|@expo(nent)?/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|@sentry/.*)',
  ],
  testEnvironment: 'node',
  coveragePathIgnorePatterns: ['<rootDir>/assets/', '<rootDir>/tests/'],
};
