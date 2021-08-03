import React from 'react';
import { render } from '@testing-library/react-native';

import { TextSubheading } from '../../src/components';

describe('<TextSubheading />', () => {
  it('Rendering', () => {
    const screen = render(<TextSubheading>This is a test text</TextSubheading>);
    expect(screen.toJSON()).toMatchSnapshot();
  });
});
