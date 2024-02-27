import React from 'react';
import { render, waitFor } from '@testing-library/react-native';

import i18n from '../../src/config/i18n';
import { LocalizationContext } from '../../src/context/localizationContext';
import Settings from '../../src/screens/Settings';

describe('<Settings />', () => {
  storage = {
    load: jest.fn().mockImplementation(() => Promise.resolve([{ name: 'English', code: 'en_US' }])),
  };

  it('render', async () => {
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
    await waitFor(() => {
      expect(screen.toJSON()).toMatchSnapshot();
    });
  });
});
