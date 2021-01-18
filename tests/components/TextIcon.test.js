import React from 'react';
import TestRenderer from 'react-test-renderer';

import { TextIcon } from '../../src/components';

describe('<TextIcon />', () => {
  it('Rendering', () => {
    const tree = TestRenderer.create(
      <TextIcon icon="check-circle" color="#000000">
        Hello
      </TextIcon>
    ).toJSON();

    expect(tree.type).toBe('View');
    // expect to have icon and text
    expect(tree.children).toHaveLength(2);
    expect(tree.children[1].children[0]).toBe('Hello');
  });
});
