import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

import { LoginSettingsButton } from '../../src/components/LoginSettingsButton';

describe('<LoginSettingsButton />', () => {
  it('Rendering', () => {
    const screen = render(<LoginSettingsButton navigation={global.mockedNavigation} />);
    expect(screen.toJSON()).toMatchSnapshot();
  });

  it('button can be pressed', () => {
    const screen = render(<LoginSettingsButton navigation={global.mockedNavigation} />);
    const button = screen.getByA11yRole('button');
    fireEvent.press(button);

    expect(global.mockedNavigation.navigate.mock.calls.length).toBe(1);
    expect(global.mockedNavigation.navigate.mock.calls[0][0]).toBe('LoginSettings');
  });
});
