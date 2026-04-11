import React, { useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Share, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Edit3, Search } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../hooks/useTheme';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { communityApi, Post } from '../../api/community';
import { FeedTabSelector, FeedType } from '../../components/community/FeedTabSelector';
import { FeedList } from '../../components/community/FeedList';

/**
 * @description 사용자들 간의 로또 관련 정보 공유 및 소통을 위한 커뮤니티 화면입니다.
 */
const CommunityScreen = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isDark } = useTheme();
  const [feedType, setFeedType] = useState<FeedType>('all');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['communityPosts', feedType],
    queryFn: () => feedType === 'all' ? communityApi.getPosts(0, 20) : communityApi.getFeed(0, 20),
  });

  const posts: Post[] = data?.content ?? [];

  const likeMutation = useMutation({
    mutationFn: (id: number) => communityApi.likePost(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['communityPosts', feedType] }),
    onError: () => Alert.alert('오류', '좋아요 처리 중 오류가 발생했습니다.'),
  });

  const handleShare = async (id: number) => {
    const post = posts.find(p => p.id === id);
    if (post) {
      try {
        await Share.share({ message: `${post.userSummary?.nickname}님의 게시물: ${post.content}` });
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
        <TouchableOpacity><Search size={24} color={isDark ? '#FFFFFF' : '#1A1A1A'} /></TouchableOpacity>
      </View>

      <FeedTabSelector feedType={feedType} onSelect={setFeedType} />
      <FeedList
        posts={posts}
        isLoading={isLoading}
        onRefresh={refetch}
        onLike={(id) => likeMutation.mutate(id)}
        onShare={handleShare}
        onCreatePost={() => router.push('/create-post')}
      />

      {/* Floating Action Button */}
      <View style={{
        position: 'absolute', bottom: 24, right: 24,
        shadowColor: '#4CAF50', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 8,
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
