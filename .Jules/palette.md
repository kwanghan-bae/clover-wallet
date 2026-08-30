## 2024-03-21 - Added Accessibility Labels to Icon-Only Buttons
**Learning:** React Native `TouchableOpacity` components wrapping icon-only elements (e.g., using `lucide-react-native`) do not inherently have accessibility labels or roles. This causes screen readers to either ignore them entirely or announce them as unhelpful interactive elements. This pattern is prevalent in this app's UI components, like the PostCard.
**Action:** When adding or reviewing interactive icons in React Native/Expo, always explicitly add `accessibilityRole="button"` and a descriptive `accessibilityLabel` to the wrapper `TouchableOpacity` or `Pressable`.
## 2024-05-18 - Icon-Only Button Accessibility in React Native
**Learning:** In React Native, icon-only buttons (like `TouchableOpacity` wrapping a `Search` icon) do not provide any context to screen readers by default. This makes the app unusable for visually impaired users who rely on VoiceOver or TalkBack.
**Action:** Always add `accessibilityLabel` (e.g., "검색") and `accessibilityRole="button"` to `TouchableOpacity` or `Pressable` wrappers when they only contain icons. Also, enhance touch feedback with `activeOpacity` and ensure a sufficient touch target size (e.g., using padding).
## 2024-05-01 - Enhance TextInput with Visual Focus and Accessibility
**Learning:** React Native TextInputs often lack proper explicit accessibility associations (like linking a label with `nativeID` and `accessibilityLabelledBy`) and visual feedback for focus state. This causes screen reader issues and makes keyboard/touch navigation unclear.
**Action:** Always track focus state in custom Input components to apply visual indicators (e.g., changing border color). Also use `accessibilityLabelledBy`, `accessibilityHint`, and `accessibilityState={{ invalid: ... }}` to fully describe the input's purpose and state to assistive technologies.
## 2024-06-18 - Loading State Accessibility and Touch Targets
**Learning:** When text inside a button is replaced by an `ActivityIndicator` (spinner) during a loading state, screen readers lose the button's label and context if it's not explicitly declared. Additionally, standalone icon buttons require explicit padding (like `p-2`) to ensure a large enough minimum touch target size for mobile accessibility.
**Action:** Always verify `PrimaryButton` and custom interactable components dynamically update their `accessibilityLabel` and `accessibilityState={{ busy: isLoading }}`. Ensure small icons are wrapped in padding classes to enlarge the tappable area.
## 2024-05-18 - Accessibility State on Dynamic Action Buttons
**Learning:** In React Native, action buttons that change state dynamically (e.g., Follow/Unfollow buttons that can also be disabled while "processing") do not automatically inform screen readers of their state change or disabled status if only the text changes. Screen readers need explicit state management via `accessibilityState` and `accessibilityLabel` based on those dynamic states.
**Action:** When a `Pressable` or `TouchableOpacity` has multiple states (like loading, disabled, toggled), ensure you apply conditional logic to `accessibilityLabel` and utilize `accessibilityState={{ disabled: isPending }}` to announce these nuances clearly to assistive technology users.
## 2026-05-09 - Dynamic Width during Loading States
**Learning:** In React Native, replacing text with a smaller `ActivityIndicator` inside a `TouchableOpacity` can cause the button to shrink or shift layout unexpectedly, creating a jarring UX during loading transitions.
**Action:** When swapping content for spinners, ensure the button container has a minimum width (e.g., `min-w-[140px]` in Tailwind/NativeWind) to preserve the layout structure and provide a smooth visual transition.
## 2026-05-09 - Enhance Touch Targets for Header Icons
**Learning:** Icon-only buttons located in headers (like `lucide-react-native` icons wrapped in `TouchableOpacity`) often have small touch targets (Apple HIG: 44pt, Material: 48dp), leading to frustrating user experiences on mobile.
**Action:** Wrap header icons with padding classes (e.g., `className="p-3 -mr-3"`) so a 24px icon reaches a ~48dp tappable area without altering visual alignment, and use `activeOpacity={0.7}` as the standard interaction feedback across the app.

## 2024-05-16 - Text Input Clear Mechanism
**Learning:** Adding an inline 'clear' button inside `TextInput` components significantly improves mobile text-entry UX, but it must be coupled with adequate padding on the `TextInput` itself (e.g., `pr-10`) to prevent the user's typed text from overlapping visually with the absolute-positioned clear icon.
**Action:** When implementing inline icons within inputs, ensure the input padding accommodates the icon dimensions and use `hitSlop` to ensure the icon is easily tappable on touch screens.

## 2026-05-15 - Pressable Touch Feedback
**Learning:** In React Native, `Pressable` components, unlike `TouchableOpacity`, do not have built-in visual feedback upon touch, leading to an unresponsive UX.
**Action:** When using `Pressable` instead of `TouchableOpacity` (e.g., inside components like `CommentItem`), consistently provide visual touch feedback by applying an inline style function: `style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}`.

## 2024-05-19 - Keyboard Submission and Disabled States in Modals
**Learning:** React Native modal components with forms often lack explicit disabled states on confirm buttons when required fields are empty, and TextInputs may not support submitting the form directly from the mobile keyboard (e.g., via the "Done" key). This creates a disjointed UX and poor accessibility because screen readers do not know the button is disabled, and users must manually dismiss the keyboard to click submit.
**Action:** Always map `disabled` state and `accessibilityState={{ disabled: true }}` to submission buttons in modals based on form validation. Additionally, equip `<TextInput>` with `returnKeyType="done"` and `onSubmitEditing` to handle keyboard-based form submission gracefully.

## 2024-03-22 - Destructive Action Confirmation in Lists
**Learning:** In React Native, destructive actions (like delete buttons) in list items should always be wrapped in an `Alert.alert` confirmation dialog to prevent accidental data loss, especially since `hitSlop` is often used to increase the tap area.
**Action:** When implementing a destructive action like deleting a record from a list (e.g. `HistoryItem`), always display a confirmation dialog before executing the action.
