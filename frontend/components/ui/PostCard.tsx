import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Heart, MessageSquare, Share2 } from 'lucide-react-native';
import { Post } from '../../api/types/community';

interface PostCardProps {
  post: Post;
  onPress?: (id: number) => void;
}

export const PostCard = ({ post, onPress }: PostCardProps) => {
  const nickname = post.user?.nickname || '익명';
  const initial = nickname[0];

  return (
    <TouchableOpacity 
      activeOpacity={0.7}
      onPress={() => onPress?.(post.id)}
      className="bg-white rounded-2xl p-4 mb-4 border border-gray-100 shadow-sm"
    >
      <View className="flex-row items-center mb-3">
        <View className="w-10 h-10 rounded-full bg-primary/20 items-center justify-center mr-3">
          <Text className="text-primary font-bold">{initial}</Text>
        </View>
        <View>
          <Text className="text-text-dark font-bold">{nickname}</Text>
          <Text className="text-text-light text-xs">{new Date(post.createdAt).toLocaleDateString()}</Text>
        </View>
      </View>

      <Text className="text-text-dark mb-4 text-base" numberOfLines={5}>
        {post.content}
      </Text>

      {/* TODO: 백엔드 DTO에 imageUrl 추가 시 활성화 */}
      {/* {post.imageUrl && (
        <Image
          source={post.imageUrl}
          style={{ width: '100%', height: 200, borderRadius: 12, marginBottom: 16 }}
          contentFit="cover"
          transition={1000}
        />
      )} */}

      <View className="flex-row items-center gap-6 border-t border-gray-50 pt-3">
        <View className="flex-row items-center gap-1">
          <Heart size={18} color={post.isLiked ? "#4CAF50" : "#757575"} fill={post.isLiked ? "#4CAF50" : "transparent"} />
          <Text className="text-text-light text-sm">{post.likeCount}</Text>
        </View>
        <View className="flex-row items-center gap-1">
          <MessageSquare size={18} color="#757575" />
          <Text className="text-text-light text-sm">0</Text>
        </View>
        <TouchableOpacity className="ml-auto">
          <Share2 size={18} color="#757575" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};
