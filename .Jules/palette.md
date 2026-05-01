## 2024-03-21 - Added Accessibility Labels to Icon-Only Buttons
**Learning:** React Native `TouchableOpacity` components wrapping icon-only elements (e.g., using `lucide-react-native`) do not inherently have accessibility labels or roles. This causes screen readers to either ignore them entirely or announce them as unhelpful interactive elements. This pattern is prevalent in this app's UI components, like the PostCard.
**Action:** When adding or reviewing interactive icons in React Native/Expo, always explicitly add `accessibilityRole="button"` and a descriptive `accessibilityLabel` to the wrapper `TouchableOpacity` or `Pressable`.
## 2026-04-29 - A11y Label State Sync
**Learning:** Hard-coding a11y labels on buttons with asynchronous states (like 'saving') can be confusing if the label doesn't match the current state.
**Action:** When a button's content changes dynamically based on state (e.g., `<Text>{isSaving ? "저장 중" : "저장"}</Text>`), ensure its `accessibilityLabel` mirrors that dynamic state (e.g., `accessibilityLabel={isSaving ? "저장 중" : "저장"}`) so screen readers accurately announce the current context.
