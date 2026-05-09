/* eslint-disable react/display-name */
// Mock Reanimated
jest.mock('react-native-reanimated', () => {
  const React = require('react');
  const { View, Text, ScrollView } = require('react-native');
  const mockDefault = {
    createAnimatedComponent: (c) => c,
    View: (props) => React.createElement(View, props),
    Text: (props) => React.createElement(Text, props),
    ScrollView: (props) => React.createElement(ScrollView, props),
  };
  return {
    __esModule: true,
    default: mockDefault,
    useSharedValue: (v) => ({ value: v }),
    useAnimatedStyle: (cb) => cb(),
    useAnimatedProps: (cb) => cb(),
    withTiming: (v) => v,
    withSpring: (v) => v,
    withDelay: (_delay, v) => v,
    runOnJS: (fn) => fn,
    makeMutable: (v) => ({ value: v }),
    createAnimatedComponent: (c) => c,
    Animated: {
      View: (props) => React.createElement(View, props),
      Text: (props) => React.createElement(Text, props),
      ScrollView: (props) => React.createElement(ScrollView, props),
      createAnimatedComponent: (c) => c,
    },
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
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy', Soft: 'soft', Rigid: 'rigid' },
  NotificationFeedbackType: { Success: 'success', Warning: 'warning', Error: 'error' },
}));

jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  getExpoPushTokenAsync: jest.fn(),
  setNotificationChannelAsync: jest.fn(async () => {}),
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

// Mock LuckyHeroIllustration (uses react-native-svg)
jest.mock('./components/ui/LuckyHeroIllustration', () => {
  const React = require('react');
  const { View } = require('react-native');
  const LuckyHeroIllustration = () => React.createElement(View, { testID: 'hero-illustration' });
  return { __esModule: true, default: LuckyHeroIllustration, LuckyHeroIllustration };
});

// Mock react-native-svg
jest.mock('react-native-svg', () => {
  const React = require('react');
  const { View } = require('react-native');
  const mockComponent = (name) => (props) => React.createElement(View, { ...props, testID: name });
  return {
    __esModule: true,
    default: mockComponent('Svg'),
    Svg: mockComponent('Svg'),
    Path: mockComponent('Path'),
    Circle: mockComponent('Circle'),
    G: mockComponent('G'),
    Defs: mockComponent('Defs'),
    LinearGradient: mockComponent('LinearGradient'),
    Stop: mockComponent('Stop'),
    Rect: mockComponent('Rect'),
    Text: mockComponent('SvgText'),
    Line: mockComponent('Line'),
    ClipPath: mockComponent('ClipPath'),
    Use: mockComponent('Use'),
    Image: mockComponent('SvgImage'),
    Mask: mockComponent('Mask'),
    Pattern: mockComponent('Pattern'),
  };
});

// Mock Safe Area
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }) => children,
  SafeAreaView: ({ children }) => children,
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

// Mock expo-linear-gradient
jest.mock('expo-linear-gradient', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    LinearGradient: (props) => React.createElement(View, { ...props, testID: props.testID || 'linear-gradient' }),
  };
});

// Mock expo-camera
jest.mock('expo-camera', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    CameraView: React.forwardRef((props, ref) =>
      React.createElement(View, { ...props, ref, testID: 'camera-view' })
    ),
    useCameraPermissions: () => [{ granted: true }, jest.fn()],
  };
});

// Mock @shopify/flash-list - renders items directly for testability
jest.mock('@shopify/flash-list', () => {
  const React = require('react');
  const { View } = require('react-native');
  const FlashList = React.forwardRef((props, ref) => {
    const items = props.data || [];
    return React.createElement(
      View,
      { ref },
      items.map((item, index) =>
        props.renderItem ? props.renderItem({ item, index }) : null
      ),
      !items.length && props.ListEmptyComponent
        ? (typeof props.ListEmptyComponent === 'function'
          ? React.createElement(props.ListEmptyComponent)
          : props.ListEmptyComponent)
        : null
    );
  });
  return { FlashList };
});

// Mock @tanstack/react-query
jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn().mockReturnValue({ data: undefined, isLoading: false, refetch: jest.fn() }),
  useMutation: jest.fn().mockReturnValue({ mutate: jest.fn(), isPending: false }),
  useQueryClient: jest.fn().mockReturnValue({ invalidateQueries: jest.fn() }),
  QueryClient: jest.fn(),
  QueryClientProvider: ({ children }) => children,
}));

// Mock hooks
jest.mock('./hooks/useAuth', () => ({
  useAuth: jest.fn().mockReturnValue({
    user: { id: 1, email: 'test@test.com', nickname: 'TestUser' },
    isLoading: false,
    isAuthenticated: true,
    signInWithGoogle: jest.fn(),
    logout: jest.fn(),
  }),
}));

jest.mock('./hooks/useNotifications', () => ({
  useNotifications: jest.fn().mockReturnValue({
    unreadCount: 0,
    expoPushToken: null,
    registerToken: jest.fn(),
    markAsRead: jest.fn(),
  }),
}));

jest.mock('./hooks/useTheme', () => ({
  useTheme: jest.fn().mockReturnValue({
    themePreference: 'system',
    isDark: false,
    setThemePreference: jest.fn(),
  }),
  ThemePreference: {},
}));

jest.mock('./hooks/useScan', () => ({
  useScan: jest.fn().mockReturnValue({
    permission: { granted: true },
    requestPermission: jest.fn(),
    cameraRef: { current: null },
    isProcessing: false,
    scanResult: null,
    scanMode: 'qr',
    setScanMode: jest.fn(),
    handleCapture: jest.fn(),
    handleBarCodeScanned: jest.fn(),
    resetScan: jest.fn(),
  }),
}));