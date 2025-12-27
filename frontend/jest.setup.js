// Mock NativeWind - Removed to avoid _ReactNativeCSSInterop error
// jest.mock("nativewind", ...);

// Mock Reanimated
jest.mock('react-native-reanimated', () => {
  const React = require('react');
  const { View, Text, ScrollView } = require('react-native');
  return {
    useSharedValue: (v) => ({ value: v }),
    useAnimatedStyle: (cb) => cb(),
    useAnimatedProps: (cb) => cb(),
    withTiming: (v) => v,
    withSpring: (v) => v,
    runOnJS: (fn) => fn,
    makeMutable: (v) => ({ value: v }),
    Animated: {
      View: (props) => React.createElement(View, props),
      Text: (props) => React.createElement(Text, props),
      ScrollView: (props) => React.createElement(ScrollView, props),
      createAnimatedComponent: (c) => c,
    },
    default: { call: () => {} },
    FadeIn: { duration: () => ({ delay: () => {} }) },
    FadeOut: { duration: () => ({ delay: () => {} }) },
    SlideInRight: { duration: () => ({ delay: () => {} }) },
  };
});

// Mock Worklets
jest.mock('react-native-worklets-core', () => ({
  Worklets: { createRunOnJS: (fn) => fn, createContext: () => ({}) },
}));

// Mock MMKV
jest.mock('react-native-mmkv', () => ({
  MMKV: jest.fn().mockImplementation(() => ({
    set: jest.fn(),
    getString: jest.fn(),
    delete: jest.fn(),
    clearAll: jest.fn(),
  })),
}));

// Mock Expo Modules
jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  getExpoPushTokenAsync: jest.fn(),
  AndroidImportance: { MAX: 5 },
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
  useFocusEffect: (cb) => cb(),
  Stack: { Screen: () => null },
  Tabs: { Screen: () => null }
}));

// Mock Icons
jest.mock('lucide-react-native', () => {
  const React = require('react');
  return new Proxy({}, {
    get: (target, name) => (props) => React.createElement('View', { ...props, testID: name }),
  });
});

// Mock Safe Area
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }) => children,
  SafeAreaView: ({ children }) => children,
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));
