import React from 'react';
import { render } from '@testing-library/react-native';

import { Loader } from '../../src/components';

describe('<Loader />', () => {
  it('Rendering', () => {
    const screen = render(<Loader loading />);
    expect(screen.toJSON()).toMatchSnapshot();
  });
});
