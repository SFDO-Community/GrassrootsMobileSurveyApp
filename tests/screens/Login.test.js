import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';

import i18n from '../../src/config/i18n';
import LocalizationContext from '../../src/context/localizationContext';
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

    // expect one login button
    expect(screen.getAllByA11yRole('button')).toHaveLength(1);

    // expect not to show modal
    expect(screen.queryByTestId('modal')).toHaveProp('visible', false);

    // email error should be rendered pressing login button with the initial state
    const loginButton = screen.getByA11yRole('button');
    fireEvent.press(loginButton);

    // password error should be rendered
    expect(screen.getByText(translate('ENTER_EMAIL'))).toBeTruthy();
  });

  it('validate invalid email', () => {
    const screen = render(
      <LocalizationContext.Provider value={localizationContext}>
        <Login />
      </LocalizationContext.Provider>
    );

    const emailInput = screen.getByPlaceholderText('yourname@example.com');
    fireEvent.changeText(emailInput, 'hello');

    const loginButton = screen.getByA11yRole('button');
    fireEvent.press(loginButton);

    // invalid email error should be rendered
    expect(screen.getByText(translate('ENTER_VALID_EMAIL'))).toBeTruthy();
  });

  it('validate blank password', () => {
    const screen = render(
      <LocalizationContext.Provider value={localizationContext}>
        <Login />
      </LocalizationContext.Provider>
    );

    const emailInput = screen.getByPlaceholderText('yourname@example.com');
    fireEvent.changeText(emailInput, 'hello@example.com');

    const loginButton = screen.getByA11yRole('button');
    fireEvent.press(loginButton);

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

    const emailInput = screen.getByPlaceholderText('yourname@example.com');
    fireEvent.changeText(emailInput, 'hello@example.com');

    const passwordInput = screen.getByPlaceholderText('password');
    fireEvent.changeText(passwordInput, 'password');

    const loginButton = screen.getByA11yRole('button');
    await act(async () => {
      fireEvent.press(loginButton);
    });

    // expect to show modal
    expect(screen.queryByTestId('modal')).toHaveProp('visible', true);
  });
});
