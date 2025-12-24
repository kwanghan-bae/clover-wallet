import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, RefreshControl } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Edit3, MessageCircle, Search } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { PostCard } from '../../components/ui/PostCard';
import { Post } from '../../api/types/community';

export default function CommunityScreen() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPosts = async () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F5F7FA]">
      {/* Header */}
      <View className="flex-row justify-between items-center px-5 py-4 bg-transparent">
        <Text className="text-xl font-extrabold text-[#1A1A1A]">커뮤니티</Text>
        <TouchableOpacity>
          <Search size={24} color="#1A1A1A" />
        </TouchableOpacity>
      </View>

      <View className="flex-1">
        <FlashList
          data={posts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <PostCard post={item} onPress={() => {}} />
          )}
          estimatedItemSize={180}
          showsVerticalScrollIndicator={false}
          onRefresh={fetchPosts}
          refreshing={isLoading}
          contentContainerStyle={{ padding: 20 }}
          ListEmptyComponent={
            <View className="items-center justify-center py-32">
              <View className="bg-primary/5 p-8 rounded-full mb-6">
                <MessageCircle size={60} color="#4CAF50" className="opacity-50" />
              </View>
              <Text className="text-lg font-bold text-[#1A1A1A]">아직 게시물이 없습니다</Text>
              <Text className="text-gray-500 mt-2 text-center">첫 번째 게시물의 주인공이 되어보세요!</Text>
              
              <TouchableOpacity 
                onPress={() => router.push('/create-post')}
                className="bg-primary px-8 py-4 rounded-full mt-10 shadow-lg"
              >
                <Text className="text-white font-bold text-base">게시물 작성하기</Text>
              </TouchableOpacity>
            </View>
          }
        />
      </View>

      {/* Floating Action Button - Gradient simulated with bg-primary */}
      <TouchableOpacity 
        activeOpacity={0.8}
        onPress={() => router.push('/create-post')}
        className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-primary items-center justify-center shadow-xl border border-white/20"
      >
        <Edit3 size={24} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}