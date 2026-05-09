import React, { memo } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { AppText } from '../ui/AppText';

export type FeedType = 'all' | 'following';

export interface FeedTabSelectorProps {
  feedType: FeedType;
  onSelect: (type: FeedType) => void;
}

/** @description 전체/팔로잉 피드 전환 탭 셀렉터 컴포넌트입니다. */
const FeedTabSelectorComponent = ({ feedType, onSelect }: FeedTabSelectorProps) => (
  <View className="flex-row mx-5 mt-3 mb-1 bg-text-primary/[0.04] dark:bg-dark-surface rounded-full p-1">
    {(['all', 'following'] as const).map((type) => {
      const isActive = feedType === type;
      const label = type === 'all' ? '전체' : '팔로잉';
      return (
        <TouchableOpacity
          key={type}
          onPress={() => onSelect(type)}
          activeOpacity={0.8}
          accessibilityRole="tab"
          accessibilityLabel={label}
          accessibilityState={{ selected: isActive }}
          className={`flex-1 py-2 rounded-full items-center ${isActive ? 'bg-surface dark:bg-dark-card shadow-card' : ''}`}
        >
          <AppText
            variant="body"
            className={isActive ? 'text-text-primary dark:text-dark-text' : 'text-text-muted dark:text-dark-text-secondary'}
          >
            {label}
          </AppText>
        </TouchableOpacity>
      );
    })}
  </View>
);

export const FeedTabSelector = memo(FeedTabSelectorComponent);
