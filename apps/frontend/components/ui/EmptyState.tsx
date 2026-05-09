import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { AppText } from './AppText';

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
}) => (
  <View className={`items-center justify-center px-6 py-10 ${className ?? ''}`}>
    <View className="w-14 h-14 rounded-card items-center justify-center mb-3 bg-primary/10">
      {icon}
    </View>
    <AppText variant="title" className="text-text-primary dark:text-dark-text text-center">
      {title}
    </AppText>
    {description ? (
      <AppText variant="caption" className="text-text-muted dark:text-dark-text-secondary mt-1 text-center">
        {description}
      </AppText>
    ) : null}
    {cta ? (
      <TouchableOpacity
        onPress={cta.onPress}
        accessibilityRole="button"
        accessibilityLabel={cta.label}
        activeOpacity={0.7}
        className="mt-3 bg-primary/10 px-4 py-2 rounded-md"
      >
        <AppText variant="caption" className="text-primary-text">
          {cta.label}
        </AppText>
      </TouchableOpacity>
    ) : null}
  </View>
);

EmptyState.displayName = 'EmptyState';
