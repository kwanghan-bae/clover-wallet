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
    '**/__tests__/**/*.test.ts', // .tsx 제외, .ts 로직 테스트만 우선 수행
  ],
};
