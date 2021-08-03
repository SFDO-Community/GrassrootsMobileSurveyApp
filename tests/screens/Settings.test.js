import React from 'react';
import renderer from 'react-test-renderer';

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

    const screen = renderer.create(
      <LocalizationContext.Provider value={localizationContext}>
        <Settings />
      </LocalizationContext.Provider>
    );
    const tree = screen.toJSON();
    expect(tree.children).toHaveLength(4); // Image, Modal, View, View
  });
});
