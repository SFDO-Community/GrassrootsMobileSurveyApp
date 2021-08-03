import React from 'react';
import { render } from '@testing-library/react-native';

import { TextIcon } from '../../src/components';

describe('<TextIcon />', () => {
  it('Rendering', () => {
    const screen = render(
      <TextIcon icon="check-circle" color="#000000">
        Hello
      </TextIcon>
    );
    expect(screen.toJSON()).toMatchSnapshot();
  });
});
