import React from 'react';
import { render } from '@testing-library/react-native';

import { TextInput } from '../../src/components/surveyEditor';

describe('<TextInput />', () => {
  it('Rendering', () => {
    const screen = render(<TextInput title="Test" />);
    expect(screen.toJSON()).toMatchSnapshot();
  });
});
