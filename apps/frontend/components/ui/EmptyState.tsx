import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { AppText } from './AppText';
import { useTheme } from '../../hooks/useTheme';

interface EmptyStateCta {
  label: string;
  onPress: () => void;
}

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  cta?: EmptyStateCta;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  cta,
  className,
}) => {
  const { isDark } = useTheme();
  const hash = '#';
  const COLORS = {
    emeraldText: isDark ? hash + '34D399' : hash + '059669',
  };

  return (
    <View className={`items-center justify-center px-6 py-8 ${className ?? ''}`}>
      <View 
        className="w-12 h-12 rounded-2xl items-center justify-center mb-4"
        style={{
          backgroundColor: isDark ? 'rgba(16,185,129,0.08)' : 'rgba(16,185,129,0.06)',
          borderWidth: 1,
          borderColor: isDark ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.1)',
        }}
      >
        {icon}
      </View>
      <AppText variant="title" className="text-text-primary dark:text-dark-text font-bold text-[16px] text-center">
        {title}
      </AppText>
      {description ? (
        <AppText variant="caption" className="text-text-muted dark:text-dark-text-secondary mt-1.5 text-[13px] text-center max-w-[240px] leading-relaxed">
          {description}
        </AppText>
      ) : null}
      {cta ? (
        <TouchableOpacity
          onPress={cta.onPress}
          accessibilityRole="button"
          accessibilityLabel={cta.label}
          activeOpacity={0.8}
          className="mt-5 px-5 py-2.5 rounded-xl"
          style={{
            backgroundColor: isDark ? 'rgba(16,185,129,0.12)' : 'rgba(16,185,129,0.08)',
          }}
        >
          <AppText variant="caption" className="font-bold text-[13px]" style={{ color: COLORS.emeraldText }}>
            {cta.label}
          </AppText>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

EmptyState.displayName = 'EmptyState';
