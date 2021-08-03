import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

import { LoginFormInput } from '../../src/components';

describe('<LoginFormInput />', () => {
  it('Rendering', () => {
    const screen = render(
      <LoginFormInput
        onChangeText={jest.fn()}
        value="test@example.com"
        label="Email"
        placeholder="yourname@example.com"
        icon="email-outline"
        keyboardType="email-address"
        errorMessage="test error message"
      />
    );
    expect(screen.toJSON()).toMatchSnapshot();
  });

  it('onchange', () => {
    const mockOnChange = jest.fn();
    const screen = render(
      <LoginFormInput
        onChangeText={mockOnChange}
        value="test@example.com"
        label="Email"
        placeholder="yourname@example.com"
        icon="email-outline"
        keyboardType="email-address"
        errorMessage="test error message"
      />
    );

    const input = screen.getByPlaceholderText('yourname@example.com');
    fireEvent.changeText(input, 'test2@example.com');

    expect(mockOnChange.mock.calls.length).toBe(1);
    expect(mockOnChange.mock.calls[0][0]).toBe('test2@example.com');
  });
});
