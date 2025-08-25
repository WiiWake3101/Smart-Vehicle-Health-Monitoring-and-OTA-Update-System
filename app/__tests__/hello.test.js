import React from 'react';
import { render } from '@testing-library/react-native';
import SignUpPage from '../../components/signup_page';
import LoginPage from '../../components/Loginpage';

// Mock React Navigation before importing HomePage
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
  useFocusEffect: jest.fn(),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
}));

// Mock Expo dependencies
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children }) => children,
}));

jest.mock('@expo/vector-icons', () => ({
  MaterialCommunityIcons: 'MaterialCommunityIcons',
  FontAwesome5: 'FontAwesome5',
  Ionicons: 'Ionicons',
  Feather: 'Feather',
  MaterialIcons: 'MaterialIcons',
  AntDesign: 'AntDesign',
}));

jest.mock('../../lib/supabase', () => {
  // Chainable mock for .select().eq() and .eq().select()
  const chainMock = {
    select: jest.fn(() => chainMock),
    eq: jest.fn(() => chainMock),
    insert: jest.fn(() => chainMock),
    update: jest.fn(() => chainMock),
    delete: jest.fn(() => chainMock),
    // Add then/catch to allow awaiting
    then: jest.fn((resolve) => resolve({ data: [], error: null })),
    catch: jest.fn(),
  };
  const fromMock = jest.fn(() => chainMock);

  const supabaseMock = {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      getUser: jest.fn(() =>
        Promise.resolve({
          data: { user: { id: 'test-user-id' } },
          error: null,
        })
      ),
    },
    from: fromMock,
    channel: jest.fn(() => ({
      on: jest.fn(() => ({
        subscribe: jest.fn(),
      })),
      subscribe: jest.fn(),
      unsubscribe: jest.fn(),
    })),
  };
  return {
    __esModule: true,
    default: supabaseMock,
    supabase: supabaseMock,
  };
});

// Test LoginPage component
describe('LoginPage Component', () => {
  it('renders without crashing', () => {
    const { toJSON } = render(<LoginPage />);
    expect(toJSON()).toBeTruthy();
  });
});

// Test SignUpPage component
describe('SignUpPage Component', () => {
  it('renders without crashing', () => {
    const { toJSON } = render(<SignUpPage />);
    expect(toJSON()).toBeTruthy();
  });
});