import React from 'react';
import { render } from '@testing-library/react-native';

import App from '../App';

jest.mock('expo-font', () => '');

describe('<App />', () => {
  it('Before font loading', () => {
    const screen = render(<App />);
    expect(screen.toJSON()).toMatchSnapshot();
  });
});
