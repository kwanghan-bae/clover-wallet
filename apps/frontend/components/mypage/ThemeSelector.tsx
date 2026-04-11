import React, { memo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Sun, Moon, Smartphone } from 'lucide-react-native';
import { ThemePreference } from '../../hooks/useTheme';

export interface ThemeSelectorProps {
  themePreference: ThemePreference;
  onSelect: (pref: ThemePreference) => void;
}

const THEME_OPTIONS: { key: ThemePreference; label: string }[] = [
  { key: 'system', label: '시스템' },
  { key: 'light', label: '라이트' },
  { key: 'dark', label: '다크' },
];

function getIcon(key: ThemePreference, isSelected: boolean) {
  const color = isSelected ? '#fff' : '#757575';
  switch (key) {
    case 'system': return <Smartphone size={18} color={color} />;
    case 'light':  return <Sun size={18} color={color} />;
    case 'dark':   return <Moon size={18} color={color} />;
  }
}

/** @description 시스템/라이트/다크 테마를 전환하는 토글 셀렉터 컴포넌트입니다. */
const ThemeSelectorComponent = ({ themePreference, onSelect }: ThemeSelectorProps) => (
  <View className="px-5 mb-6" testID="theme-selector">
    <Text style={{ fontFamily: 'NotoSansKR_700Bold' }} className="text-lg text-[#1A1A1A] dark:text-dark-text mb-4">
      테마 설정
    </Text>
    <View
      className="bg-white dark:bg-dark-card rounded-[24px] p-4"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 16,
        elevation: 2,
      }}
    >
      <View className="flex-row justify-between">
        {THEME_OPTIONS.map(({ key, label }) => (
          <TouchableOpacity
            key={key}
            onPress={() => onSelect(key)}
            className={`flex-1 flex-row items-center justify-center py-3 rounded-2xl mx-1 ${themePreference === key ? 'bg-primary' : 'bg-gray-100 dark:bg-dark-surface'}`}
            style={{ gap: 6 }}
            accessibilityRole="radio"
            accessibilityLabel={label}
            accessibilityState={{ selected: themePreference === key }}
          >
            {getIcon(key, themePreference === key)}
            <Text
              style={{ fontFamily: 'NotoSansKR_500Medium' }}
              className={`text-sm ${themePreference === key ? 'text-white' : 'text-[#757575] dark:text-dark-text-secondary'}`}
            >
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  </View>
);

export const ThemeSelector = memo(ThemeSelectorComponent);
