import React from 'react';
import TestRenderer from 'react-test-renderer';

import { TextSubheading } from '../../src/components';

describe('<TextSubheading />', () => {
  it('Rendering', () => {
    const tree = TestRenderer.create(<TextSubheading>This is a test text</TextSubheading>).toJSON();

    expect(tree.type).toBe('Text');
    // expect to have icon and text
    expect(tree.props.style.fontSize).toBe(12);
    expect(tree.children).toHaveLength(1);
    expect(tree.children[0]).toBe('This is a test text');
  });
});
