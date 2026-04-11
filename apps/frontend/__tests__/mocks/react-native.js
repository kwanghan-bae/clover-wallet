// Minimal react-native mock for monorepo Jest tests
// (react-native-web hoisting breaks resolution in npm workspaces)
const React = require('react');

const View = (props) => React.createElement('div', props);
const Text = (props) => React.createElement('span', props);
const ScrollView = (props) => React.createElement('div', props);
const TextInput = (props) => React.createElement('input', props);
const TouchableOpacity = (props) => React.createElement('div', props);
const Pressable = (props) => React.createElement('div', props);
const FlatList = (props) => React.createElement('div', props);
const ActivityIndicator = (props) => React.createElement('div', props);
const Image = (props) => React.createElement('img', props);

const StyleSheet = {
  create: (styles) => styles,
  flatten: (style) => (Array.isArray(style) ? Object.assign({}, ...style) : style || {}),
  hairlineWidth: 1,
};

const Platform = {
  OS: 'ios',
  select: (obj) => obj.ios || obj.default,
  Version: 14,
};

const Dimensions = {
  get: () => ({ width: 375, height: 812, scale: 2, fontScale: 1 }),
  addEventListener: jest.fn(() => ({ remove: jest.fn() })),
};

const Animated = {
  View,
  Text,
  Image,
  ScrollView,
  FlatList,
  Value: jest.fn(() => ({
    setValue: jest.fn(),
    interpolate: jest.fn(() => 0),
  })),
  timing: jest.fn(() => ({ start: jest.fn() })),
  spring: jest.fn(() => ({ start: jest.fn() })),
  event: jest.fn(),
  createAnimatedComponent: (c) => c,
};

const Alert = { alert: jest.fn() };
const Linking = { openURL: jest.fn(), canOpenURL: jest.fn(() => Promise.resolve(true)) };
const AppState = { currentState: 'active', addEventListener: jest.fn(() => ({ remove: jest.fn() })) };
const Keyboard = { dismiss: jest.fn(), addListener: jest.fn(() => ({ remove: jest.fn() })) };

const useColorScheme = jest.fn().mockReturnValue('light');
const useWindowDimensions = jest.fn().mockReturnValue({ width: 375, height: 812 });

module.exports = {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Pressable,
  FlatList,
  ActivityIndicator,
  Image,
  StyleSheet,
  Platform,
  Dimensions,
  Animated,
  Alert,
  Linking,
  AppState,
  Keyboard,
  useColorScheme,
  useWindowDimensions,
};
