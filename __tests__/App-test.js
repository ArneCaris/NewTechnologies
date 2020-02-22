/**
 * @format
 */

import 'react-native';
import React from 'react';
import App from '../App';
// import mockAsyncStorage from '@react-native-community/async-storage/jest/async-storage-mock';
// jest.mock('@react-native-community/async-storage', () => mockAsyncStorage);

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';

beforeAll(() => { 
  jest.mock('@react-native-community/async-storage');
})

it('renders correctly', () => {
  renderer.create(<App />);
});
