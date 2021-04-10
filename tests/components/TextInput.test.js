import React from 'react';
import TestRenderer from 'react-test-renderer';

import { TextInput } from '../../src/components/surveyEditor';

describe('<TextInput />', () => {
  it('Rendering', () => {
    const tree = TestRenderer.create(<TextInput title="Test" />).toJSON();

    expect(tree.children[0].children[0]).toBe('Test'); // label
  });
});
