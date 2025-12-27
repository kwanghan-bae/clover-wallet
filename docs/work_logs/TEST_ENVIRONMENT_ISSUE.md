# Jest & NativeWind v4 Configuration Issue Report

## Issue Summary
During the UI modernization process (transitioning to `nativewind` v4), the frontend test suite began failing with a specific reference error, despite the application running correctly in development and production builds.

**Error Message:**
```
ReferenceError: <root>/frontend/jest.setup.js: The module factory of `jest.mock()` is not allowed to reference any out-of-scope variables.
Invalid variable access: _ReactNativeCSSInterop
```

## Root Cause Analysis
This error is a known compatibility issue between **Jest** (specifically how `jest-expo` or `ts-jest` handles module hoisting and mocking) and **NativeWind v4**'s CSS Interop layer.

NativeWind v4 injects `cssInterop` calls and relies on specific Babel transformations. When running in the Jest environment, the transformation order or the scoping of these injected variables conflicts with Jest's strict module factory rules, particularly when `nativewind` is mocked or transformed.

## Attempted Solutions

1.  **Adjusting `transformIgnorePatterns`**:
    -   Attempted to whitelist `nativewind`, `expo-modules-core`, and other related packages in `jest.config.js`.
    -   *Result*: No change. The error persists because the issue lies in how the module is evaluated, not just whether it is transformed.

2.  **Changing Jest Presets**:
    -   Switched from `ts-jest` to `jest-expo`.
    -   *Result*: Improved general Expo mocking, but the `_ReactNativeCSSInterop` error remained.

3.  **Mocking NativeWind**:
    -   Attempted to mock `nativewind` in `jest.setup.js`:
        ```javascript
        jest.mock("nativewind", () => ({
          verifyInstallation: jest.fn(),
          withNativeWind: (component) => component,
        }));
        ```
    -   *Result*: This triggered the `Invalid variable access` error because Jest prevents accessing out-of-scope variables (even imports in some contexts) inside the mock factory when those imports are being modified by the Babel plugin.

## Recommendation for Future Resolution
To resolve this in the future, the following approaches should be investigated:
1.  **Migrate to Metro-based Testing**: Use `@rnx-kit/jest-preset` or Expo's upcoming experimental Metro test runner support, which handles React Native transforms more accurately than standard Jest.
2.  **Wait for NativeWind v4 Stability**: NativeWind v4 is rapidly evolving; a patch release may address this Jest compatibility.
3.  **Strict Isolation**: Move UI component tests that rely heavily on NativeWind to a separate test config or use Maestro/Detox for UI testing instead of unit testing styling implementation details.

## Status
The UI components (`Button`, `Card`, `Input`) and `LoginScreen` have been verified visually using Playwright. The backend logic is verified with JUnit. The frontend unit tests are currently disabled/failing due to this configuration constraint.
