import React, { memo } from 'react';
import { View, Text, TouchableOpacity, Animated, ActivityIndicator } from 'react-native';
import { Sparkles, Save, Share2 } from 'lucide-react-native';
import { GenerationResultCard } from './GenerationResultCard';
import { labelOf } from '../../utils/lotto';

export interface GenerationResultCardsProps {
  games: number[][];
  methodTitle?: string;
  scaleAnim: Animated.Value;
  isSaving: boolean;
  onSave: () => void;
  onShare: () => void;
}

/**
 * @description N세트 결과 카드 묶음 + 묶음 단위 저장/공유 버튼.
 * length===0 → 빈 상태, length===1 → 라벨 없는 단일 카드 (기존 디자인 보존),
 * length>1 → 라벨('A'~) 카드 세로 스택.
 */
const GenerationResultCardsComponent = ({
  games,
  methodTitle,
  scaleAnim,
  isSaving,
  onSave,
  onShare,
}: GenerationResultCardsProps) => {
  const isMulti = games.length > 1;

  return (
    <View className="bg-primary rounded-[24px] p-6 shadow-lg overflow-hidden">
      {methodTitle ? (
        <View className="self-center bg-white/20 px-4 py-2 rounded-full border border-white/30 mb-5">
          <Text className="text-white font-bold">{methodTitle}</Text>
        </View>
      ) : null}

      {games.length === 0 ? (
        <View className="items-center py-4">
          <Sparkles size={56} color="white" />
          <Text className="text-white/70 text-base mt-4 text-center">
            아래에서 생성 방식을 선택하세요!
          </Text>
        </View>
      ) : (
        <View>
          {games.map((numbers, i) => (
            <GenerationResultCard
              key={i}
              numbers={numbers}
              scaleAnim={scaleAnim}
              label={isMulti ? labelOf(i) : undefined}
              delay={i * 80}
            />
          ))}
        </View>
      )}

      {games.length > 0 ? (
        <View className="flex-row mt-4 gap-3 justify-center">
          <TouchableOpacity
            onPress={onSave}
            disabled={isSaving}
            activeOpacity={0.7}
            className="bg-white px-6 py-3 rounded-full shadow-sm flex-row items-center justify-center min-w-[140px]"
            accessibilityRole="button"
            accessibilityLabel="번호 저장하기"
            accessibilityState={{ disabled: isSaving, busy: isSaving }}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#4CAF50" />
            ) : (
              <>
                <Save size={18} color="#4CAF50" />
                <Text className="text-primary font-bold ml-2">번호 저장하기</Text>
              </>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onShare}
            activeOpacity={0.7}
            className="bg-white px-6 py-3 rounded-full shadow-sm flex-row items-center justify-center min-w-[140px]"
            accessibilityRole="button"
            accessibilityLabel="커뮤니티에 공유"
          >
            <Share2 size={18} color="#4CAF50" />
            <Text className="text-primary font-bold ml-2">커뮤니티에 공유</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
};

export const GenerationResultCards = memo(GenerationResultCardsComponent);
