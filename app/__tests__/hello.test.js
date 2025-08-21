import React from 'react';
import { render } from '@testing-library/react-native';
import HomePage from '../../components/HomePage';

test('HomePage renders', () => {
  const { getByText } = render(<HomePage />);
  // Replace 'Home' with actual text in your HomePage component
  expect(getByText('Home')).toBeTruthy();
});