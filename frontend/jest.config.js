/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
    }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '^react-native$': '<rootDir>/node_modules/react-native-web',
    '^expo-router$': '<rootDir>/__tests__/mocks/expo-router.js',
  },
  collectCoverage: true,
  collectCoverageFrom: [
    'utils/**/*.ts',
  ],
  testMatch: [
    '**/__tests__/**/*.test.ts',
    // '**/__tests__/**/*.test.tsx', // TSX 테스트는 환경 안정화 후 복구
  ],
};
