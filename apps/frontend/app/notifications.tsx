import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Stack } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Bell, Trophy, Info } from 'lucide-react-native';
import { notificationsApi, Notification } from '../api/notifications';
import { useNotifications } from '../hooks/useNotifications';

/**
 * @description 알림 유형에 따라 아이콘을 반환하는 함수입니다.
 */
function NotificationIcon({ type }: { type: Notification['type'] }) {
  if (type === 'WINNING') return <Trophy size={20} color="#FFC107" />;
  if (type === 'SYSTEM') return <Info size={20} color="#2196F3" />;
  return <Bell size={20} color="#4CAF50" />;
}

/**
 * @description 개별 알림 항목 컴포넌트입니다.
 */
function NotificationItem({
  item,
  onPress,
}: {
  item: Notification;
  onPress: (id: number) => void;
}) {
  return (
    <TouchableOpacity
      onPress={() => onPress(item.id)}
      className={`flex-row items-start p-4 mx-4 mb-2 rounded-2xl ${item.isRead ? 'bg-white dark:bg-dark-surface' : 'bg-green-50 dark:bg-green-900/20'}`}
      accessibilityLabel={`${item.title}: ${item.message}`}
      accessibilityRole="button"
      accessibilityState={{ selected: !item.isRead }}
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
      }}
    >
      <View className="w-10 h-10 rounded-full bg-gray-100 dark:bg-dark-card items-center justify-center mr-3">
        <NotificationIcon type={item.type} />
      </View>
      <View className="flex-1">
        <View className="flex-row items-center justify-between mb-1">
          <Text
            style={{ fontFamily: 'NotoSansKR_700Bold' }}
            className="text-[#1A1A1A] dark:text-dark-text text-sm flex-1 mr-2"
            numberOfLines={1}
          >
            {item.title}
          </Text>
          {!item.isRead && (
            <View className="w-2 h-2 rounded-full bg-[#4CAF50]" />
          )}
        </View>
        <Text
          style={{ fontFamily: 'NotoSansKR_400Regular' }}
          className="text-[#757575] dark:text-dark-text-secondary text-xs leading-4"
          numberOfLines={2}
        >
          {item.message}
        </Text>
        <Text
          style={{ fontFamily: 'NotoSansKR_400Regular' }}
          className="text-[#BDBDBD] text-xs mt-1"
        >
          {new Date(item.createdAt).toLocaleDateString('ko-KR', {
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

/**
 * @description 알림 목록이 비어 있을 때 표시되는 빈 상태 컴포넌트입니다.
 */
function EmptyState() {
  return (
    <View className="flex-1 items-center justify-center py-24">
      <View className="w-16 h-16 rounded-full bg-gray-100 dark:bg-dark-card items-center justify-center mb-4">
        <Bell size={28} color="#BDBDBD" />
      </View>
      <Text
        style={{ fontFamily: 'NotoSansKR_500Medium' }}
        className="text-[#BDBDBD] text-base"
      >
        알림이 없습니다
      </Text>
    </View>
  );
}

/**
 * @description 사용자의 알림 목록을 표시하는 화면입니다.
 */
export default function NotificationsScreen() {
  const { markAsRead } = useNotifications();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.getMyNotifications(),
  });

  const notifications = data?.content ?? [];

  const handlePress = async (id: number) => {
    await markAsRead(id);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F5F7FA] dark:bg-dark-bg">
      <Stack.Screen options={{ title: '알림', headerShown: true }} />
      {!isLoading && notifications.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <NotificationItem item={item} onPress={handlePress} />
          )}
          contentContainerStyle={{ paddingTop: 12, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}
