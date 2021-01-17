import React from 'react';
import renderer from 'react-test-renderer';

import App from '../App';

jest.mock('expo-font', () => '');

describe('<App />', () => {
  it('Before font loading', () => {
    const tree = renderer.create(<App />).toJSON();
    expect(tree).toBeNull();
  });
});
