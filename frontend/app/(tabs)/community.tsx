import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { PostCard } from '../../components/ui/PostCard';
import { Post } from '../../api/types/community';

// Mock Data for UI verification
const MOCK_POSTS: Post[] = [
  {
    id: 1,
    content: "I can't believe I won the 3rd prize with the numbers I generated from this app! Best luck ever.",
    user: {
      id: 101,
      nickname: "LuckyClover",
      badges: ["Winner"],
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    likeCount: 24,
    viewCount: 150,
    isLiked: false,
  },
  {
    id: 2,
    content: "Has anyone visited the famous spot near Gangnam station? Thinking of going there this weekend.",
    user: {
      id: 102,
      nickname: "Seoulite",
    },
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    likeCount: 12,
    viewCount: 85,
    isLiked: true,
  },
];

export default function CommunityScreen() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPosts = async () => {
    // TODO: Connect to communityApi.getPosts()
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-4 pt-4">
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
          ListHeaderComponent={
            <View className="py-4">
              <Text className="text-2xl font-bold text-text-dark">Stories</Text>
              <Text className="text-text-light">Share your luck with the community</Text>
            </View>
          }
        />
      </View>

      {/* Floating Action Button */}
      <TouchableOpacity 
        activeOpacity={0.8}
        onPress={() => router.push('/create-post')}
        className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-primary items-center justify-center shadow-lg"
      >
        <Plus size={28} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}