module.exports = {
  preset: "jest-expo",
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|expo-notifications|expo-device|expo-constants|expo-modules-core|expo-asset|expo|@expo|expo-file-system|expo-font)"
  ],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  collectCoverage: true,
  collectCoverageFrom: [
    "utils/**/*.{ts,tsx}",
    "components/**/*.{ts,tsx}"
  ],
  moduleNameMapper: {
    "^expo-router$": "<rootDir>/__tests__/mocks/expo-router.js"
  }
};
