import React from 'react';
import TestRenderer from 'react-test-renderer';

import { TextHeading } from '../../src/components';

describe('<TextHeading />', () => {
  it('Rendering', () => {
    const tree = TestRenderer.create(<TextHeading>This is a test text</TextHeading>).toJSON();

    expect(tree.type).toBe('Text');
    // expect to have icon and text
    expect(tree.props.style.fontSize).toBe(16);
    expect(tree.children).toHaveLength(1);
    expect(tree.children[0]).toBe('This is a test text');
  });
});
