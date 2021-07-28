import React from 'react';
import renderer from 'react-test-renderer';

import i18n from '../../src/config/i18n';
import LocalizationContext from '../../src/context/localizationContext';
import Login from '../../src/screens/Login';

jest.mock('react-native-keyboard-aware-scroll-view', () => {
  const KeyboardAwareScrollView = ({ children }) => children;
  return { KeyboardAwareScrollView };
});

describe('<Login />', () => {
  it('render', () => {
    const locale = i18n.locale;
    const localizationContext = {
      t: jest.fn(),
      locale,
      setLocale: jest.fn(),
    };
    global.storage = { load: jest.fn().mockImplementation(() => Promise.resolve()) };

    const screen = renderer.create(
      <LocalizationContext.Provider value={localizationContext}>
        <Login />
      </LocalizationContext.Provider>
    );
    const tree = screen.toJSON();
    expect(tree.children).toHaveLength(5);
  });
});
