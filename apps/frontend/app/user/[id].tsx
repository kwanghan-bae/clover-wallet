import React, { useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, SafeAreaView } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../../api/users';
import { useAuth } from '../../hooks/useAuth';
import { PostCard } from '../../components/ui/PostCard';
import { ProfileHeader } from '../../components/profile/ProfileHeader';
import { Post } from '../../api/community';

/**
 * @description 특정 유저의 프로필, 팔로워/팔로잉 수, 게시글 목록을 보여주는 화면입니다.
 */
export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const userId = Number(id);
  const { user: currentUser } = useAuth();
  const isMe = currentUser?.id === userId;
  const queryClient = useQueryClient();
  const [isFollowing, setIsFollowing] = useState(false);
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['userProfile', userId],
    queryFn: () => usersApi.getUserById(userId),
    enabled: !!userId,
  });

  const { data: followCounts } = useQuery({
    queryKey: ['followCounts', userId],
    queryFn: () => usersApi.getFollowCounts(userId),
    enabled: !!userId,
  });

  const { data: postsData } = useQuery({
    queryKey: ['userPosts', userId],
    queryFn: () => usersApi.getUserPosts(userId, 0, 20),
    enabled: !!userId,
  });

  const followMutation = useMutation({
    mutationFn: () => usersApi.toggleFollow(userId),
    onSuccess: (data: { following: boolean }) => {
      setIsFollowing(data.following);
      queryClient.invalidateQueries({ queryKey: ['followCounts', userId] });
    },
  });

  const posts: Post[] = (postsData as { content?: Post[] })?.content ?? [];

  if (profileLoading) {
    return (
      <SafeAreaView className="flex-1 bg-[#F5F7FA] dark:bg-dark-bg items-center justify-center">
        <Stack.Screen options={{ title: '프로필' }} />
        <ActivityIndicator size="large" color="#4CAF50" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F5F7FA] dark:bg-dark-bg">
      <Stack.Screen options={{ title: profile?.nickname ?? '유저 프로필', headerBackTitle: '뒤로' }} />
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <PostCard post={item} onPress={() => {}} />
        )}
        ListHeaderComponent={
          <ProfileHeader
            nickname={profile?.nickname}
            email={profile?.email}
            followCounts={followCounts}
            isMe={isMe}
            isFollowing={isFollowing}
            isFollowPending={followMutation.isPending}
            onFollowToggle={() => followMutation.mutate()}
          />
        }
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="items-center justify-center py-16 px-5">
            <Text style={{ fontFamily: 'NotoSansKR_400Regular' }} className="text-[#BDBDBD] dark:text-dark-text-secondary text-center">
              아직 작성한 게시물이 없습니다.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
