/* global __dirname */
const path = require('path');

// Skip @testing-library/react-native peer deps check
// (hoisted deps in monorepo cause false version mismatch)
process.env.RNTL_SKIP_DEPS_CHECK = '1';

// Ensure hoisted packages at root can resolve deps from this workspace
const existingNodePath = process.env.NODE_PATH || '';
process.env.NODE_PATH = path.resolve(__dirname, 'node_modules') +
  (existingNodePath ? path.delimiter + existingNodePath : '');
require('module').Module._initPaths();

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
  // Support monorepo: resolve from both local and root node_modules
  moduleDirectories: ['node_modules', path.resolve(__dirname, '../../node_modules')],
  transformIgnorePatterns: [
    'node_modules/(?!(ky)/)',
  ],
  moduleNameMapper: {
    '^react-native$': '<rootDir>/__tests__/mocks/react-native.js',
    '^expo-router$': '<rootDir>/__tests__/mocks/expo-router.js',
    '^react-native-mmkv$': '<rootDir>/__tests__/mocks/react-native-mmkv.js',
    '^expo-notifications$': '<rootDir>/__tests__/mocks/expo-notifications.js',
    '^expo-device$': '<rootDir>/__tests__/mocks/expo-device.js',
    '^expo-constants$': '<rootDir>/__tests__/mocks/expo-constants.js',
  },
  collectCoverage: true,
  collectCoverageFrom: [
    'utils/**/*.ts',
    'hooks/**/*.ts',
    'api/**/*.ts',
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testMatch: [
    '**/__tests__/**/*.test.ts',
  ],
};
