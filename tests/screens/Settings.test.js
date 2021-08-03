import React from 'react';
import { render } from '@testing-library/react-native';

import i18n from '../../src/config/i18n';
import LocalizationContext from '../../src/context/localizationContext';
import Settings from '../../src/screens/Settings';

describe('<Settings />', () => {
  it('render', () => {
    const locale = i18n.locale;
    const localizationContext = {
      t: jest.fn(),
      locale,
      setLocale: jest.fn(),
    };

    const screen = render(
      <LocalizationContext.Provider value={localizationContext}>
        <Settings />
      </LocalizationContext.Provider>
    );
    expect(screen.toJSON()).toMatchSnapshot();
  });
});
