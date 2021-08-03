import React from 'react';
import { render } from '@testing-library/react-native';

import { CheckboxButton } from '../../src/components/surveyEditor';

describe('<CheckboxButton />', () => {
  it('Rendering', () => {
    const screen = render(<CheckboxButton title="Test" selected />);
    expect(screen.toJSON()).toMatchSnapshot();
  });
});
