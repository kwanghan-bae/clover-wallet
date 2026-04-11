import React, { memo } from 'react';
import { View, Text, Pressable } from 'react-native';
import { ProfileStats, FollowCounts } from './ProfileStats';

export interface ProfileHeaderProps {
  nickname?: string | null;
  email?: string | null;
  followCounts?: FollowCounts | null;
  isMe: boolean;
  isFollowing?: boolean;
  isFollowPending: boolean;
  onFollowToggle: () => void;
}

/** @description 유저 프로필 상단: 아바타, 닉네임, 이메일, 팔로우 버튼 */
const ProfileHeaderComponent = ({
  nickname,
  email,
  followCounts,
  isMe,
  isFollowing,
  isFollowPending,
  onFollowToggle,
}: ProfileHeaderProps) => {
  const displayName = nickname ?? '이름 없음';
  const initial = (nickname ?? email ?? '?')[0].toUpperCase();

  return (
    <View className="bg-white dark:bg-dark-surface px-5 pt-6 pb-5 mb-2">
      <View className="flex-row items-center mb-4">
        <View className="w-16 h-16 rounded-full bg-[#4CAF50]/10 items-center justify-center mr-4">
          <Text style={{ fontFamily: 'NotoSansKR_700Bold' }} className="text-[#4CAF50] text-2xl">
            {initial}
          </Text>
        </View>
        <View className="flex-1">
          <Text style={{ fontFamily: 'NotoSansKR_700Bold' }} className="text-[#1A1A1A] dark:text-dark-text text-lg">
            {displayName}
          </Text>
          <Text style={{ fontFamily: 'NotoSansKR_400Regular' }} className="text-[#9E9E9E] dark:text-dark-text-secondary text-sm mt-0.5">
            {email}
          </Text>
        </View>
      </View>

      <ProfileStats followCounts={followCounts} />

      {!isMe && (
        <Pressable
          onPress={onFollowToggle}
          disabled={isFollowPending}
          className={`py-2.5 rounded-full items-center border ${isFollowing ? 'border-gray-300' : 'border-[#4CAF50]'}`}
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
        >
          <Text style={{ fontFamily: 'NotoSansKR_700Bold' }} className={`text-sm ${isFollowing ? 'text-gray-500' : 'text-[#4CAF50]'}`}>
            {isFollowPending ? '처리 중...' : isFollowing ? '팔로우 취소' : '팔로우'}
          </Text>
        </Pressable>
      )}
    </View>
  );
};

export const ProfileHeader = memo(ProfileHeaderComponent);
