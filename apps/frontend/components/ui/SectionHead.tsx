import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { AppText } from './AppText';

interface SectionHeadProps {
  title: string;
  linkText?: string;
  onLinkPress?: () => void;
  className?: string;
}

export const SectionHead: React.FC<SectionHeadProps> = ({
  title,
  linkText,
  onLinkPress,
  className,
}) => (
  <View className={`flex-row justify-between items-baseline mt-8 mb-3 ${className ?? ''}`}>
    <AppText variant="title" className="text-text-primary dark:text-dark-text">
      {title}
    </AppText>
    {linkText ? (
      <TouchableOpacity
        onPress={onLinkPress}
        accessibilityRole="button"
        accessibilityLabel={linkText}
        activeOpacity={0.7}
      >
        <AppText variant="caption" className="text-primary-text">
          {linkText} ›
        </AppText>
      </TouchableOpacity>
    ) : null}
  </View>
);

SectionHead.displayName = 'SectionHead';
