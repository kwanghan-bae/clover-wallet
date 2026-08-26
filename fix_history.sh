sed -i 's/as Array<{text: string, style?: string, onPress?: () => void}>/as {text: string, style?: string, onPress?: () => void}[]/' apps/frontend/__tests__/components/ui/HistoryItem.test.tsx
