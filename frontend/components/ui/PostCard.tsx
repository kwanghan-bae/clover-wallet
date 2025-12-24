import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Heart, MessageCircle, Eye, Share2, MoreHorizontal } from 'lucide-react-native';
import { Post } from '../../api/types/community';

interface PostCardProps {
  post: Post;
  onPress?: (id: number) => void;
  onLike?: (id: number) => void;
  onShare?: (id: number) => void;
}

export const PostCard = ({ post, onPress, onLike, onShare }: PostCardProps) => {
  const nickname = post.user?.nickname || '익명';
  const initial = nickname[0];
  const dateStr = formatDate(post.createdAt);

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onPress?.(post.id)}
      className="bg-white rounded-[24px] p-5 mb-5"
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
        {/* Avatar */}
        <View className="w-10 h-10 rounded-full bg-[#4CAF50]/10 items-center justify-center mr-3">
          <Text style={{ fontFamily: 'NotoSansKR_700Bold' }} className="text-[#4CAF50] text-base">
            {initial}
          </Text>
        </View>

        {/* Author & Info */}
        <View className="flex-1">
          <View className="flex-row items-center">
            <Text style={{ fontFamily: 'NotoSansKR_700Bold' }} className="text-[#1A1A1A] text-[15px]">
              {nickname}
            </Text>
            {/* Badges could be added here if available in type */}
          </View>
          <Text style={{ fontFamily: 'NotoSansKR_400Regular' }} className="text-[#BDBDBD] text-[12px] mt-0.5">
            {dateStr}
          </Text>
        </View>

        <TouchableOpacity className="p-1">
          <MoreHorizontal size={20} color="#E0E0E0" />
        </TouchableOpacity>
      </View>

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
            {post.likeCount}
          </Text>
        </TouchableOpacity>

        <View className="flex-row items-center mr-5">
          <MessageCircle size={18} color="#9E9E9E" />
          <Text style={{ fontFamily: 'NotoSansKR_500Medium' }} className="ml-1.5 text-[13px] text-[#757575]">
            0
          </Text>
        </View>

        <View className="flex-row items-center">
          <Eye size={18} color="#BDBDBD" />
          <Text style={{ fontFamily: 'NotoSansKR_500Medium' }} className="ml-1.5 text-[13px] text-[#BDBDBD]">
            {post.viewCount}
          </Text>
        </View>

        <View className="flex-1" />

        <TouchableOpacity onPress={() => onShare?.(post.id)} className="p-1">
          <Share2 size={18} color="#BDBDBD" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

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
