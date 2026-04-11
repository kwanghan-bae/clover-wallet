import React, { useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Share, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FlashList } from '@shopify/flash-list';
import { Edit3, Search, MessageSquare } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PostCard } from '../../components/ui/PostCard';
import { communityApi, Post } from '../../api/community';

/**
 * @description 사용자들 간의 로또 관련 정보 공유 및 소통을 위한 커뮤니티 화면입니다.
 */
const CommunityScreen = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [feedType, setFeedType] = useState<'all' | 'following'>('all');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['communityPosts', feedType],
    queryFn: () => feedType === 'all' ? communityApi.getPosts(0, 20) : communityApi.getFeed(0, 20),
  });

  const posts: Post[] = data?.content ?? [];

  const likeMutation = useMutation({
    mutationFn: (id: number) => communityApi.likePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communityPosts', feedType] });
    },
    onError: () => {
      Alert.alert('오류', '좋아요 처리 중 오류가 발생했습니다.');
    },
  });

  const handleLike = (id: number) => {
    likeMutation.mutate(id);
  };

  const handleShare = async (id: number) => {
    const post = posts.find(p => p.id === id);
    if (post) {
      try {
        await Share.share({
          message: `${post.userSummary?.nickname}님의 게시물: ${post.content}`,
        });
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F5F7FA] dark:bg-dark-bg">
      {/* Header */}
      <View
        className="flex-row justify-between items-center px-5 py-4 bg-white/80 dark:bg-dark-surface"
        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <Text style={{ fontFamily: 'NotoSansKR_700Bold' }} className="text-xl text-[#1A1A1A] dark:text-dark-text">커뮤니티</Text>
        <TouchableOpacity>
          <Search size={24} color="#1A1A1A" />
        </TouchableOpacity>
      </View>

      {/* Feed Type Segment Control */}
      <View className="flex-row mx-5 mt-3 mb-1 bg-[#F0F0F0] dark:bg-dark-surface rounded-full p-1">
        <TouchableOpacity
          onPress={() => setFeedType('all')}
          activeOpacity={0.8}
          accessibilityRole="tab"
          accessibilityLabel="전체"
          accessibilityState={{ selected: feedType === 'all' }}
          className={`flex-1 py-2 rounded-full items-center ${feedType === 'all' ? 'bg-white dark:bg-dark-card' : ''}`}
          style={feedType === 'all' ? { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 } : undefined}
        >
          <Text
            style={{ fontFamily: 'NotoSansKR_700Bold' }}
            className={`text-sm ${feedType === 'all' ? 'text-[#1A1A1A] dark:text-dark-text' : 'text-[#9E9E9E] dark:text-dark-text-secondary'}`}
          >
            전체
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setFeedType('following')}
          activeOpacity={0.8}
          accessibilityRole="tab"
          accessibilityLabel="팔로잉"
          accessibilityState={{ selected: feedType === 'following' }}
          className={`flex-1 py-2 rounded-full items-center ${feedType === 'following' ? 'bg-white dark:bg-dark-card' : ''}`}
          style={feedType === 'following' ? { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 } : undefined}
        >
          <Text
            style={{ fontFamily: 'NotoSansKR_700Bold' }}
            className={`text-sm ${feedType === 'following' ? 'text-[#1A1A1A] dark:text-dark-text' : 'text-[#9E9E9E] dark:text-dark-text-secondary'}`}
          >
            팔로잉
          </Text>
        </TouchableOpacity>
      </View>

      <View className="flex-1">
        <FlashList
          data={posts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <PostCard
              post={item}
              onPress={() => { }}
              onLike={handleLike}
              onShare={handleShare}
            />
          )}
          estimatedItemSize={200}
          showsVerticalScrollIndicator={false}
          onRefresh={refetch}
          refreshing={isLoading}
          contentContainerStyle={{ padding: 20 }}
          ListEmptyComponent={
            <View className="items-center justify-center py-32" style={{ alignItems: 'center', justifyContent: 'center' }}>
              <View className="w-24 h-24 bg-[#4CAF50]/5 rounded-full items-center justify-center mb-8" style={{ alignItems: 'center', justifyContent: 'center' }}>
                <MessageSquare size={48} color="rgba(76, 175, 80, 0.4)" />
              </View>
              <Text style={{ fontFamily: 'NotoSansKR_700Bold' }} className="text-lg text-[#1A1A1A] dark:text-dark-text">아직 게시물이 없습니다</Text>
              <Text style={{ fontFamily: 'NotoSansKR_400Regular' }} className="text-[#BDBDBD] dark:text-dark-text-secondary mt-2 text-center">첫 번째 게시물의 주인공이 되어보세요!</Text>

              <TouchableOpacity
                onPress={() => router.push('/create-post')}
                activeOpacity={0.8}
                className="mt-10 items-center justify-center"
              >
                <LinearGradient
                  colors={['#4CAF50', '#388E3C']}
                  className="px-8 py-3.5 rounded-full"
                  style={{ shadowColor: '#4CAF50', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 8 }}
                >
                  <View className="flex-row items-center" style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Edit3 size={18} color="white" className="mr-2" />
                    <Text style={{ fontFamily: 'NotoSansKR_700Bold' }} className="text-white text-base">게시물 작성하기</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          }
        />
      </View>

      {/* Floating Action Button - Fixed positioning for Web/Native */}
      <View style={{
        position: 'absolute',
        bottom: 24,
        right: 24,
        shadowColor: '#4CAF50',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8
      }}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push('/create-post')}
          style={{ borderRadius: 28, overflow: 'hidden' }}
          accessibilityLabel="새 게시글 작성"
          accessibilityRole="button"
          testID="fab-create-post"
        >
          <LinearGradient
            colors={['#4CAF50', '#388E3C']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ width: 56, height: 56, alignItems: 'center', justifyContent: 'center' }}
          >
            <Edit3 size={24} color="white" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default CommunityScreen;
