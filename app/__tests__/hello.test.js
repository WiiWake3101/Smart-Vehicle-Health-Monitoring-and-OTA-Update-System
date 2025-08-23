import { render } from '@testing-library/react-native';

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

// Test basic Jest functionality
describe('Basic Test Suite', () => {
  it('should run a basic test', () => {
    expect(1 + 1).toBe(2);
  });
});