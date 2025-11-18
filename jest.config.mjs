export default {
  preset: 'jest-expo',
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(expo|expo-.*|react-native|@react-native|@expo|expo-modules-core|@expo/vector-icons)/)',
  ],
  setupFiles: [
    './node_modules/react-native-gesture-handler/jestSetup.js',
  ],
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.ts',
    '@testing-library/jest-native/extend-expect'
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  moduleNameMapper: {
    '^expo$': '<rootDir>/__mocks__/expo.js',
    '\\.svg$': '<rootDir>/__mocks__/svgMock.js',
    'react-native/Libraries/Animated/NativeAnimatedHelper':
    '<rootDir>/__mocks__/react-native/Libraries/Animated/NativeAnimatedHelper.js',
    '^expo/(.*)$': '<rootDir>/__mocks__/expoMock.js',
    // eslint-disable-next-line no-dupe-keys
    '^expo$': '<rootDir>/__mocks__/expoMock.js',
    '^expo-av$': '<rootDir>/__mocks__/expo-av.js',
  },
};
