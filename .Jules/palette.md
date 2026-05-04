## 2024-03-21 - Added Accessibility Labels to Icon-Only Buttons
**Learning:** React Native `TouchableOpacity` components wrapping icon-only elements (e.g., using `lucide-react-native`) do not inherently have accessibility labels or roles. This causes screen readers to either ignore them entirely or announce them as unhelpful interactive elements. This pattern is prevalent in this app's UI components, like the PostCard.
**Action:** When adding or reviewing interactive icons in React Native/Expo, always explicitly add `accessibilityRole="button"` and a descriptive `accessibilityLabel` to the wrapper `TouchableOpacity` or `Pressable`.
## 2024-05-18 - Icon-Only Button Accessibility in React Native
**Learning:** In React Native, icon-only buttons (like `TouchableOpacity` wrapping a `Search` icon) do not provide any context to screen readers by default. This makes the app unusable for visually impaired users who rely on VoiceOver or TalkBack.
**Action:** Always add `accessibilityLabel` (e.g., "검색") and `accessibilityRole="button"` to `TouchableOpacity` or `Pressable` wrappers when they only contain icons. Also, enhance touch feedback with `activeOpacity` and ensure a sufficient touch target size (e.g., using padding).
## 2024-05-01 - Enhance TextInput with Visual Focus and Accessibility
**Learning:** React Native TextInputs often lack proper explicit accessibility associations (like linking a label with `nativeID` and `accessibilityLabelledBy`) and visual feedback for focus state. This causes screen reader issues and makes keyboard/touch navigation unclear.
**Action:** Always track focus state in custom Input components to apply visual indicators (e.g., changing border color). Also use `accessibilityLabelledBy`, `accessibilityHint`, and `accessibilityState={{ invalid: ... }}` to fully describe the input's purpose and state to assistive technologies.

## 2024-05-04 - Loading State Accessibility
**Learning:** Screen readers won't announce a loading state on buttons just because an `ActivityIndicator` is shown or `disabled` is set.
**Action:** Use `accessibilityState={{ busy: isLoading }}` and dynamically update `accessibilityLabel` (e.g., adding "처리 중") when implementing a loading spinner on standard Action Buttons.
