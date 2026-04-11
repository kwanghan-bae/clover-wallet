import React from 'react';
import { View, Text, FlatList, Pressable, ActivityIndicator, SafeAreaView } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../../api/users';
import { useAuth } from '../../hooks/useAuth';
import { PostCard } from '../../components/ui/PostCard';
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
  const router = useRouter();

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followCounts', userId] });
    },
  });

  const posts: Post[] = (postsData as any)?.content ?? [];

  const ProfileHeader = () => (
    <View className="bg-white dark:bg-dark-surface px-5 pt-6 pb-5 mb-2">
      {/* Avatar + Nickname Row */}
      <View className="flex-row items-center mb-4">
        <View className="w-16 h-16 rounded-full bg-[#4CAF50]/10 items-center justify-center mr-4">
          <Text
            style={{ fontFamily: 'NotoSansKR_700Bold' }}
            className="text-[#4CAF50] text-2xl"
          >
            {(profile?.nickname ?? profile?.email ?? '?')[0].toUpperCase()}
          </Text>
        </View>
        <View className="flex-1">
          <Text
            style={{ fontFamily: 'NotoSansKR_700Bold' }}
            className="text-[#1A1A1A] dark:text-dark-text text-lg"
          >
            {profile?.nickname ?? '이름 없음'}
          </Text>
          <Text
            style={{ fontFamily: 'NotoSansKR_400Regular' }}
            className="text-[#9E9E9E] dark:text-dark-text-secondary text-sm mt-0.5"
          >
            {profile?.email}
          </Text>
        </View>
      </View>

      {/* Follow Counts */}
      <View className="flex-row mb-5">
        <View className="mr-6 items-center">
          <Text
            style={{ fontFamily: 'NotoSansKR_700Bold' }}
            className="text-[#1A1A1A] dark:text-dark-text text-base"
          >
            {followCounts?.followers ?? 0}
          </Text>
          <Text
            style={{ fontFamily: 'NotoSansKR_400Regular' }}
            className="text-[#9E9E9E] dark:text-dark-text-secondary text-xs mt-0.5"
          >
            팔로워
          </Text>
        </View>
        <View className="items-center">
          <Text
            style={{ fontFamily: 'NotoSansKR_700Bold' }}
            className="text-[#1A1A1A] dark:text-dark-text text-base"
          >
            {followCounts?.following ?? 0}
          </Text>
          <Text
            style={{ fontFamily: 'NotoSansKR_400Regular' }}
            className="text-[#9E9E9E] dark:text-dark-text-secondary text-xs mt-0.5"
          >
            팔로잉
          </Text>
        </View>
      </View>

      {/* Follow / Unfollow Button */}
      {!isMe && (
        <Pressable
          onPress={() => followMutation.mutate()}
          disabled={followMutation.isPending}
          className="py-2.5 rounded-full items-center border border-[#4CAF50]"
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
        >
          <Text
            style={{ fontFamily: 'NotoSansKR_700Bold' }}
            className="text-[#4CAF50] text-sm"
          >
            {followMutation.isPending ? '처리 중...' : '팔로우'}
          </Text>
        </Pressable>
      )}
    </View>
  );

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
      <Stack.Screen
        options={{
          title: profile?.nickname ?? '유저 프로필',
          headerBackTitle: '뒤로',
        }}
      />

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onPress={(postId) => router.push(`/community/${postId}` as any)}
          />
        )}
        ListHeaderComponent={<ProfileHeader />}
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="items-center justify-center py-16 px-5">
            <Text
              style={{ fontFamily: 'NotoSansKR_400Regular' }}
              className="text-[#BDBDBD] dark:text-dark-text-secondary text-center"
            >
              아직 작성한 게시물이 없습니다.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
