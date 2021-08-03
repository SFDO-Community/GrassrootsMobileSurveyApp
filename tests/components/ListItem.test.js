import React from 'react';
import { render } from '@testing-library/react-native';

import { ListItem } from '../../src/components';

describe('<LoginFormInput />', () => {
  it('Rendering', () => {
    const screen = render(<ListItem title="Survey 1" subtitle="Master" onPress={jest.fn()} showCaret />);
    expect(screen.toJSON()).toMatchSnapshot();
  });
});
