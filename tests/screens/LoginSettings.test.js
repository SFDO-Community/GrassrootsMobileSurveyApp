import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';

import i18n from '../../src/config/i18n';
import LocalizationContext from '../../src/context/localizationContext';
import LoginSettings from '../../src/screens/LoginSettings';
// local test utils
import { translate } from '../localization';

jest.mock('react-native-keyboard-aware-scroll-view', () => {
  const KeyboardAwareScrollView = ({ children }) => children;
  return { KeyboardAwareScrollView };
});

describe('login settings screen', () => {
  const locale = i18n.locale;
  const localizationContext = {
    t: jest.fn().mockImplementation(key => translate(key)),
    locale,
    setLocale: jest.fn(),
  };

  it('initial render', () => {
    const screen = render(
      <LocalizationContext.Provider value={localizationContext}>
        <LoginSettings />
      </LocalizationContext.Provider>
    );

    // expect one input field
    expect(screen.getByLabelText('app-name-input')).toBeTruthy();

    // save button disabled when blank
    const saveButton = screen.getByA11yRole('button');
    expect(saveButton).toBeDisabled();
  });

  it('save', async () => {
    const screen = render(
      <LocalizationContext.Provider value={localizationContext}>
        <LoginSettings />
      </LocalizationContext.Provider>
    );

    const appNameInput = screen.getByLabelText('app-name-input');
    fireEvent.changeText(appNameInput, 'test-app-123');
    const saveButton = screen.getByA11yRole('button');
    fireEvent.press(saveButton);
    expect(screen.toJSON()).toMatchSnapshot(); // value='test-app-123'
    await waitFor(() => {
      Promise.resolve();
    });
  });

  it('save with trim', async () => {
    const screen = render(
      <LocalizationContext.Provider value={localizationContext}>
        <LoginSettings />
      </LocalizationContext.Provider>
    );

    const appNameInput = screen.getByLabelText('app-name-input');
    fireEvent.changeText(appNameInput, '  test-app-123  ');

    const saveButton = screen.getByA11yRole('button');
    fireEvent.press(saveButton);

    expect(screen.toJSON()).toMatchSnapshot(); // value='test-app-123'
    await waitFor(() => {
      Promise.resolve();
    });
  });
});
