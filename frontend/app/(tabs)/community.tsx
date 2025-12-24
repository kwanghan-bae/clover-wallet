import React, { useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Share } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FlashList } from '@shopify/flash-list';
import { Edit3, Search, MessageSquare } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { PostCard } from '../../components/ui/PostCard';
import { Post } from '../../api/types/community';
import { EmptyIllustration } from '../../components/ui/EmptyIllustration';

export default function CommunityScreen() {
  const router = useRouter();
  const [posts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPosts = async () => {
    setIsLoading(true);
    // Real API call should be here
    setTimeout(() => setIsLoading(false), 1000);
  };

  const handleLike = (id: number) => {
    // Implement like logic
    console.log('Like post:', id);
  };

  const handleShare = async (id: number) => {
    const post = posts.find(p => p.id === id);
    if (post) {
      try {
        await Share.share({
          message: `${post.user?.nickname}님의 게시물: ${post.content}`,
        });
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F5F7FA]">
      {/* Header */}
      <View className="flex-row justify-between items-center px-5 py-4 bg-transparent">
        <Text style={{ fontFamily: 'NotoSansKR_700Bold' }} className="text-xl text-[#1A1A1A]">커뮤니티</Text>
        <TouchableOpacity>
          <Search size={24} color="#1A1A1A" />
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
          onRefresh={fetchPosts}
          refreshing={isLoading}
          contentContainerStyle={{ padding: 20 }}
          ListEmptyComponent={
            <View className="items-center justify-center py-32">
              <View className="w-24 h-24 bg-[#4CAF50]/5 rounded-full items-center justify-center mb-8">
                <MessageSquare size={48} color="rgba(76, 175, 80, 0.4)" />
              </View>
              <Text style={{ fontFamily: 'NotoSansKR_700Bold' }} className="text-lg text-[#1A1A1A]">아직 게시물이 없습니다</Text>
              <Text style={{ fontFamily: 'NotoSansKR_400Regular' }} className="text-[#757575] mt-2 text-center">첫 번째 게시물의 주인공이 되어보세요!</Text>

              <TouchableOpacity
                onPress={() => router.push('/create-post')}
                activeOpacity={0.8}
                className="mt-10 items-center justify-center"
              >
                <LinearGradient
                  colors={['#4CAF50', '#388E3C']}
                  className="px-8 py-3.5 rounded-full shadow-lg"
                >
                  <View className="flex-row items-center">
                    <Edit3 size={18} color="white" className="mr-2" />
                    <Text style={{ fontFamily: 'NotoSansKR_700Bold' }} className="text-white text-base">게시물 작성하기</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          }
        />
      </View>

      {/* Floating Action Button - Gradient */}
      <View className="absolute bottom-6 right-6" style={{
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
}