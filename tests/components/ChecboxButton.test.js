import React from 'react';
import TestRenderer from 'react-test-renderer';

import { CheckboxButton } from '../../src/components/surveyEditor';

jest.mock('react-native-elements/src/icons/Icon', () => 'View');

describe('<CheckboxButton />', () => {
  it('Rendering', () => {
    const tree = TestRenderer.create(<CheckboxButton title="Test" selected />).toJSON();

    expect(tree.type).toBe('View'); // TouchableOpacity
    expect(tree.children[1].children[0]).toBe('Test'); //label
  });
});
