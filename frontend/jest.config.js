/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
      isolatedModules: true,
    }],
    '^.+\\.js$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
      isolatedModules: true,
    }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transformIgnorePatterns: [
    'node_modules/(?!(ky)/)',
  ],
  moduleNameMapper: {
    '^react-native$': '<rootDir>/node_modules/react-native-web',
    '^expo-router$': '<rootDir>/__tests__/mocks/expo-router.js',
    '^react-native-mmkv$': '<rootDir>/__tests__/mocks/react-native-mmkv.js',
    '^expo-notifications$': '<rootDir>/__tests__/mocks/expo-notifications.js',
    '^expo-device$': '<rootDir>/__tests__/mocks/expo-device.js',
    '^expo-constants$': '<rootDir>/__tests__/mocks/expo-constants.js',
  },
  collectCoverage: true,
  collectCoverageFrom: [
    'utils/**/*.ts',
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testMatch: [
    '**/__tests__/**/*.test.ts',
  ],
};
