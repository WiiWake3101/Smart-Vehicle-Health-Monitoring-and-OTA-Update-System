import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Text, Button } from 'react-native';

// Mock supabase signup function
const mockSignUp = jest.fn();

// Mock useNavigation if needed
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn() }),
}));

// Mock supabase module if used in SignupPage
jest.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: (...args) => mockSignUp(...args),
    },
  },
}));

import SignupPage from '../../components/signup_page';

test('renders Sign Up title', () => {
  const { getByText } = render(<SignupPage />);
  expect(getByText('Sign Up')).toBeTruthy();
});

test('shows error when signup fails', async () => {
  mockSignUp.mockResolvedValueOnce({ error: true });

  const { getByText, queryByText } = render(<SignupPage />);
  expect(queryByText('Signup failed')).toBeNull();

  fireEvent.press(getByText('Sign Up'));

  await waitFor(() => {
    expect(getByText('Signup failed')).toBeTruthy();
  });
});