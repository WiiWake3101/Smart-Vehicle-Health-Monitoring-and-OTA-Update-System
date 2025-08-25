module.exports = {
  preset: 'jest-expo',
  testMatch: ['**/__tests__/**/*.test.js'],
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
  },
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx'],
};