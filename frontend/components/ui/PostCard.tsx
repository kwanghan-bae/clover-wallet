import React, { memo } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Heart, MessageCircle, Share2, MoreHorizontal, Trash2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { Post, communityApi } from '../../api/community';
import { useAuth } from '../../hooks/useAuth';

interface PostCardProps {
  post: Post;
  onPress?: (id: number) => void;
  onLike?: (id: number) => void;
  onShare?: (id: number) => void;
}

/** @description 커뮤니티 피드에서 개별 게시글의 요약 정보를 표시하는 카드 컴포넌트입니다. */
const PostCardComponent = ({ post, onPress, onLike, onShare }: PostCardProps) => {
  const nickname = post.userSummary?.nickname || '익명';
  const initial = nickname[0];
  const dateStr = formatDate(post.createdAt);
  const commentCount = post._count?.comments ?? 0;
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const isOwner = currentUser != null && currentUser.id === post.userSummary?.id;

  const handleDeletePress = () => {
    Alert.alert(
      '게시글 삭제',
      '이 게시글을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await communityApi.deletePost(post.id);
              queryClient.invalidateQueries({ queryKey: ['communityPosts'] });
            } catch {
              Alert.alert('오류', '게시글 삭제에 실패했습니다.');
            }
          },
        },
      ],
    );
  };

  const handleUserProfilePress = () => {
    router.push(`/user/${post.userSummary.id}`);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onPress?.(post.id)}
      className="bg-white rounded-[24px] p-5 mb-5"
      accessibilityLabel={`게시글: ${post.title || post.content?.substring(0, 30)}`}
      accessibilityRole="button"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 16,
        elevation: 2,
      }}
    >
      {/* Header */}
      <View className="flex-row items-start mb-4">
        {/* Avatar (pressable → user profile) */}
        <TouchableOpacity activeOpacity={0.7} onPress={handleUserProfilePress} className="mr-3" accessibilityLabel={`${nickname} 프로필 보기`} accessibilityRole="button">
          <View className="w-10 h-10 rounded-full bg-[#4CAF50]/10 items-center justify-center">
            <Text style={{ fontFamily: 'NotoSansKR_700Bold' }} className="text-[#4CAF50] text-base">
              {initial}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Author & Info */}
        <View className="flex-1">
          <View className="flex-row items-center">
            <TouchableOpacity activeOpacity={0.7} onPress={handleUserProfilePress} accessibilityLabel={`${nickname} 프로필 보기`} accessibilityRole="link">
              <Text style={{ fontFamily: 'NotoSansKR_700Bold' }} className="text-[#1A1A1A] text-[15px]">
                {nickname}
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={{ fontFamily: 'NotoSansKR_400Regular' }} className="text-[#BDBDBD] text-[12px] mt-0.5">
            {dateStr}
          </Text>
        </View>

        {isOwner ? (
          <TouchableOpacity className="p-1" onPress={handleDeletePress} accessibilityLabel="게시글 삭제" accessibilityRole="button">
            <Trash2 size={20} color="#EF5350" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity className="p-1" accessibilityLabel="더 보기" accessibilityRole="button">
            <MoreHorizontal size={20} color="#E0E0E0" />
          </TouchableOpacity>
        )}
      </View>

      {/* Title */}
      {post.title ? (
        <Text
          style={{ fontFamily: 'NotoSansKR_700Bold' }}
          className="text-[#1A1A1A] text-[16px] mb-1"
          numberOfLines={1}
        >
          {post.title}
        </Text>
      ) : null}

      {/* Content */}
      <Text
        style={{ fontFamily: 'NotoSansKR_400Regular' }}
        className="text-[#1A1A1A] text-[15px] leading-[22.5px] mb-4"
        numberOfLines={4}
      >
        {post.content}
      </Text>

      {/* Divider */}
      <View className="h-[1px] bg-[#F5F5F5] mb-3" />

      {/* Footer / Actions */}
      <View className="flex-row items-center px-1">
        <TouchableOpacity
          onPress={() => onLike?.(post.id)}
          className="flex-row items-center mr-5"
          activeOpacity={0.6}
          accessibilityLabel={`좋아요 ${post.likes}개`}
          accessibilityRole="button"
        >
          <Heart
            size={18}
            color={post.isLiked ? "#EF5350" : "#9E9E9E"}
            fill={post.isLiked ? "#EF5350" : "transparent"}
          />
          <Text
            style={{ fontFamily: 'NotoSansKR_500Medium' }}
            className={`ml-1.5 text-[13px] ${post.isLiked ? 'text-[#EF5350]' : 'text-[#757575]'}`}
          >
            {post.likes}
          </Text>
        </TouchableOpacity>

        <View className="flex-row items-center mr-5">
          <MessageCircle size={18} color="#9E9E9E" />
          <Text style={{ fontFamily: 'NotoSansKR_500Medium' }} className="ml-1.5 text-[13px] text-[#757575]">
            {commentCount}
          </Text>
        </View>

        <View className="flex-1" />

        <TouchableOpacity onPress={() => onShare?.(post.id)} className="p-1" accessibilityLabel="공유하기" accessibilityRole="button">
          <Share2 size={18} color="#BDBDBD" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export const PostCard = memo(PostCardComponent);
PostCard.displayName = 'PostCard';

// formatDate 함수는 내부 로직을 처리합니다.
function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    return `${month}/${day} ${hours}:${minutes}`;
  } catch {
    return dateString;
  }
}
