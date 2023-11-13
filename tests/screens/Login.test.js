import React from 'react';
import { render, fireEvent, act, userEvent } from '@testing-library/react-native';

import i18n from '../../src/config/i18n';
import { LocalizationContext } from '../../src/context/localizationContext';
import Login from '../../src/screens/Login';
// local test utils
import { translate } from '../localization';
import { mockAuthSuccessResponse } from '../services/mockResponse';

jest.mock('react-native-keyboard-aware-scroll-view', () => {
  const KeyboardAwareScrollView = ({ children }) => children;
  return { KeyboardAwareScrollView };
});

jest.mock('../../src/services/salesforce/contact', () => ({
  getCurrentFieldWorker: jest.fn().mockImplementation(() => Promise.resolve({ id: 'test' })),
  storeContacts: jest.fn().mockImplementation(() => Promise.resolve()),
}));

jest.mock('../../src/services/salesforce/survey', () => ({
  storeOnlineSurveys: jest.fn().mockImplementation(() => Promise.resolve()),
}));

jest.mock('../../src/services/describe', () => ({
  retrieveAllMetadata: jest.fn().mockImplementation(() => Promise.resolve()),
}));

describe('login screen', () => {
  const locale = i18n.locale;
  const localizationContext = {
    t: jest.fn().mockImplementation(key => translate(key)),
    locale,
    setLocale: jest.fn(),
  };
  global.storage = { load: jest.fn().mockImplementation(() => Promise.resolve()), save: jest.fn() };

  it('initial render', () => {
    const screen = render(
      <LocalizationContext.Provider value={localizationContext}>
        <Login />
      </LocalizationContext.Provider>
    );
    // expect two text inputs
    expect(screen.getByPlaceholderText('yourname@example.com')).toBeTruthy();
    expect(screen.getByPlaceholderText('password')).toBeTruthy();

    // expect not to show modal
    expect(screen.queryByTestId('modal')).toHaveProp('visible', false);

    // email error should be rendered pressing login button with the initial state
    const loginButton = screen.getByTestId('login-button');
    fireEvent.press(loginButton);

    // password error should be rendered
    expect(screen.getByText(translate('ENTER_EMAIL'))).toBeTruthy();
  });

  it('validate invalid email', async () => {
    const screen = render(
      <LocalizationContext.Provider value={localizationContext}>
        <Login />
      </LocalizationContext.Provider>
    );
    const user = await userEvent.setup();

    const emailInput = screen.getByPlaceholderText('yourname@example.com');
    await user.type(emailInput, 'hello');

    const loginButton = screen.getByTestId('login-button');
    await user.press(loginButton);

    // invalid email error should be rendered
    expect(screen.getByText(translate('ENTER_VALID_EMAIL'))).toBeTruthy();
  });

  it('validate blank password', async () => {
    const screen = render(
      <LocalizationContext.Provider value={localizationContext}>
        <Login />
      </LocalizationContext.Provider>
    );
    const user = await userEvent.setup();
    
    const emailInput = screen.getByPlaceholderText('yourname@example.com');
    await user.type(emailInput, 'hello@example.com');

    const loginButton = screen.getByTestId('login-button');
    await user.press(loginButton);

    // password error should be rendered
    expect(screen.getByText(translate('ENTER_PASSWORD'))).toBeTruthy();
  });

  it('authenticate success', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce(mockAuthSuccessResponse);

    const screen = render(
      <LocalizationContext.Provider value={localizationContext}>
        <Login />
      </LocalizationContext.Provider>
    );
    const user = await userEvent.setup();
    
    const emailInput = screen.getByPlaceholderText('yourname@example.com');
    await user.type(emailInput, 'hello@example.com');

    const passwordInput = screen.getByPlaceholderText('password');
    await user.type(passwordInput, 'password');

    const loginButton = screen.getByTestId('login-button');
    await act(async () => {
      await user.press(loginButton);
    });

    // expect to show modal
    expect(screen.queryByTestId('modal')).toHaveProp('visible', true);
  });
});
