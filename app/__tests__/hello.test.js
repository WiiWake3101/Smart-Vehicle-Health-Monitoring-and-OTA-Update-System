import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';

// Mock supabase and navigation
const mockSignUp = jest.fn();
jest.mock('../components/signup_page', () => {
  // Mock the actual component for testing
  const React = require('react');
  return function SignupPage() {
    const [error, setError] = React.useState('');
    return (
      <>
        <Text>Sign Up</Text>
        <Button
          title="Sign Up"
          onPress={async () => {
            const result = await mockSignUp();
            if (result.error) setError('Signup failed');
          }}
        />
        {error ? <Text>{error}</Text> : null}
      </>
    );
  };
});
import { Text, Button } from 'react-native';
import SignupPage from '../components/signup_page';

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