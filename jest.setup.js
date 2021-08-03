const mockedNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  push: jest.fn(),
  addListener: jest.fn(),
};

global.mockedNavigation = mockedNavigation;

jest.mock('@react-navigation/native', () => {
  return {
    ...jest.requireActual('@react-navigation/native'),
    useNavigation: () => ({
      ...mockedNavigation,
    }),
  };
});

jest.mock('react-native-elements/src/icons/Icon', () => 'View');
