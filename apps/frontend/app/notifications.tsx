import React from 'react';
import { View, FlatList, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Bell, Trophy, Info } from 'lucide-react-native';
import { notificationsApi, Notification } from '../api/notifications';
import { useNotifications } from '../hooks/useNotifications';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { AppBar } from '../components/ui/AppBar';
import { AppText } from '../components/ui/AppText';
import { EmptyState } from '../components/ui/EmptyState';

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
      className={`flex-row items-start p-4 mx-4 mb-2 rounded-card shadow-card ${item.isRead ? 'bg-surface dark:bg-dark-surface' : 'bg-primary/10 dark:bg-green-900/20'}`}
      accessibilityLabel={`${item.title}: ${item.message}`}
      accessibilityRole="button"
      accessibilityState={{ selected: !item.isRead }}
    >
      <View className="w-10 h-10 rounded-pill bg-border-hairline dark:bg-dark-card items-center justify-center mr-3">
        <NotificationIcon type={item.type} />
      </View>
      <View className="flex-1">
        <View className="flex-row items-center justify-between mb-1">
          <AppText
            variant="body-lg"
            className="text-text-primary dark:text-dark-text flex-1 mr-2"
            numberOfLines={1}
          >
            {item.title}
          </AppText>
          {!item.isRead && (
            <View className="w-2 h-2 rounded-pill bg-primary" />
          )}
        </View>
        <AppText
          variant="caption"
          className="text-text-muted dark:text-dark-text-secondary leading-4"
          numberOfLines={2}
        >
          {item.message}
        </AppText>
        <AppText
          variant="caption"
          className="text-text-disabled mt-1"
        >
          {new Date(item.createdAt ?? '').toLocaleDateString('ko-KR', {
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </AppText>
      </View>
    </TouchableOpacity>
  );
}

/**
 * @description 사용자의 알림 목록을 표시하는 화면입니다.
 */
export default function NotificationsScreen() {
  const router = useRouter();
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
    <ScreenContainer>
      <Stack.Screen options={{ headerShown: false }} />
      <AppBar
        variant="screen"
        title="알림"
        onBackPress={() => router.back()}
      />
      {!isLoading && notifications.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <EmptyState
            icon={<Bell size={24} color="#2E7D32" />}
            title="새로운 알림이 없어요"
            description="당첨 결과와 새로운 소식을 이곳에서 알려드릴게요"
          />
        </View>
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
    </ScreenContainer>
  );
}
