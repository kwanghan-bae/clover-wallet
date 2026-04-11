/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.jest.json',
      isolatedModules: true,
    }],
    '^.+\\.js$': ['ts-jest', {
      tsconfig: 'tsconfig.jest.json',
      isolatedModules: true,
    }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transformIgnorePatterns: [
    'node_modules/(?!(ky)/)',
  ],
  modulePaths: ['<rootDir>/node_modules'],
  moduleNameMapper: {
    '^react-native$': '<rootDir>/__tests__/mocks/react-native.js',
    '^expo-router$': '<rootDir>/__tests__/mocks/expo-router.js',
    '^react-native-mmkv$': '<rootDir>/__tests__/mocks/react-native-mmkv.js',
    '^expo-notifications$': '<rootDir>/__tests__/mocks/expo-notifications.js',
    '^expo-device$': '<rootDir>/__tests__/mocks/expo-device.js',
    '^expo-constants$': '<rootDir>/__tests__/mocks/expo-constants.js',
    '^expo-linear-gradient$': '<rootDir>/__tests__/mocks/expo-linear-gradient.js',
    '^expo-camera$': '<rootDir>/__tests__/mocks/expo-camera.js',
    '^@shopify/flash-list$': '<rootDir>/__tests__/mocks/flash-list.js',
  },
  collectCoverage: true,
  collectCoverageFrom: [
    'utils/**/*.ts',
    'hooks/**/*.ts',
    'api/**/*.ts',
    'components/**/*.tsx',
    '!components/**/*.test.tsx',
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/__tests__/**/*.test.tsx',
  ],
};
