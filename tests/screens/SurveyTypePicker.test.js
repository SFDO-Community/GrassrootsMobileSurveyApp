import React from 'react';
import { render } from '@testing-library/react-native';

import i18n from '../../src/config/i18n';
import LocalizationContext from '../../src/context/localizationContext';
import SurveyTypePicker from '../../src/screens/SurveyTypePicker';

const mockRecordTypes = [
  {
    recordTypeId: '0125h000000kNJMAA1',
    developerName: 'Test_1',
    label: 'Test 1',
    layoutId: '00h5h000000mTxOAAU',
    active: true,
    master: false,
  },
  {
    recordTypeId: '0125h000000kNJMAA2',
    developerName: 'Test_2',
    label: 'Test 2',
    layoutId: '00h5h000000mTxOAAU',
    active: true,
    master: false,
  },
];

jest.mock('../../src/services/database/metadata', () => ({
  getAllAvailableRecordTypes: jest.fn().mockImplementation(() => Promise.resolve(mockRecordTypes)),
}));

describe('<SurveyTypePicker />', () => {
  it('render', async () => {
    const locale = i18n.locale;
    const localizationContext = {
      t: jest.fn(),
      locale,
      setLocale: jest.fn(),
    };

    const screen = render(
      <LocalizationContext.Provider value={localizationContext}>
        <SurveyTypePicker navigation={global.mockedNavigation} />
      </LocalizationContext.Provider>
    );

    const menu = await screen.findByA11yRole('menubar');
    expect(menu.props.data).toHaveLength(2);
    expect(screen.toJSON()).toMatchSnapshot();
  });
});
