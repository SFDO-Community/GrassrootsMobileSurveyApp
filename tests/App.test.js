import React from 'react';
import { render } from '@testing-library/react-native';

import App from '../App';

jest.mock('expo-font');
jest.mock('expo-asset');
jest.mock('react-native-keyboard-aware-scroll-view', () => {
  const KeyboardAwareScrollView = require('react-native').ScrollView;
  return { KeyboardAwareScrollView };
});

describe('<App />', () => {
  it('Before font loading', () => {
    const screen = render(<App />);
    expect(screen.toJSON()).toMatchSnapshot();
  });
});
