import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Heart, MessageSquare, Share2 } from 'lucide-react-native';
import { Post } from '../../api/types/community';

interface PostCardProps {
  post: Post;
  onPress?: (id: number) => void;
}

export const PostCard = ({ post, onPress }: PostCardProps) => {
  return (
    <TouchableOpacity 
      activeOpacity={0.7}
      onPress={() => onPress?.(post.id)}
      className="bg-white rounded-2xl p-4 mb-4 border border-gray-100 shadow-sm"
    >
      <View className="flex-row items-center mb-3">
        <View className="w-10 h-10 rounded-full bg-primary/20 items-center justify-center mr-3">
          <Text className="text-primary font-bold">{post.authorNickname[0]}</Text>
        </View>
        <View>
          <Text className="text-text-dark font-bold">{post.authorNickname}</Text>
          <Text className="text-text-light text-xs">{new Date(post.createdAt).toLocaleDateString()}</Text>
        </View>
      </View>

      <Text className="text-lg font-bold text-text-dark mb-2">{post.title}</Text>
      <Text className="text-text-light mb-4" numberOfLines={3}>
        {post.content}
      </Text>

      {post.imageUrl && (
        <Image
          source={post.imageUrl}
          style={{ width: '100%', height: 200, borderRadius: 12, marginBottom: 16 }}
          contentFit="cover"
          transition={1000}
        />
      )}

      <View className="flex-row items-center gap-6 border-t border-gray-50 pt-3">
        <View className="flex-row items-center gap-1">
          <Heart size={18} color="#757575" />
          <Text className="text-text-light text-sm">{post.likeCount}</Text>
        </View>
        <View className="flex-row items-center gap-1">
          <MessageSquare size={18} color="#757575" />
          <Text className="text-text-light text-sm">{post.commentCount}</Text>
        </View>
        <TouchableOpacity className="ml-auto">
          <Share2 size={18} color="#757575" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};
