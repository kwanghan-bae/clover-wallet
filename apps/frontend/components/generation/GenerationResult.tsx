import React, { memo } from 'react';
import { View, Text, TouchableOpacity, Animated, ActivityIndicator } from 'react-native';
import { Sparkles, Save, Share2 } from 'lucide-react-native';
import { getNumberColor } from '../../utils/lotto';

export interface GenerationResultProps {
  numbers: number[];
  methodTitle?: string;
  scaleAnim: Animated.Value;
  isSaving: boolean;
  onSave: () => void;
  onShare: () => void;
}

/** @description 생성된 번호 결과 표시 + 저장/공유 버튼 컴포넌트입니다. */
const GenerationResultComponent = ({
  numbers,
  methodTitle,
  scaleAnim,
  isSaving,
  onSave,
  onShare,
}: GenerationResultProps) => (
  <View className="bg-primary rounded-[24px] p-8 shadow-lg items-center overflow-hidden">
    {methodTitle ? (
      <View className="bg-white/20 px-4 py-2 rounded-full border border-white/30 mb-6">
        <Text className="text-white font-bold">{methodTitle}</Text>
      </View>
    ) : null}

    {numbers.length === 0 ? (
      <View className="items-center py-4">
        <Sparkles size={56} color="white" />
        <Text className="text-white/70 text-base mt-4 text-center">
          아래에서 생성 방식을 선택하세요!
        </Text>
      </View>
    ) : (
      <View className="flex-row flex-wrap justify-center gap-3">
        {numbers.map((n, idx) => (
          <Animated.View
            key={idx}
            style={{ transform: [{ scale: scaleAnim }] }}
            className={`${getNumberColor(n)} w-12 h-12 rounded-full items-center justify-center shadow-md`}
          >
            <Text className="text-white text-xl font-black">{n}</Text>
          </Animated.View>
        ))}
      </View>
    )}

    {numbers.length > 0 && (
      <View className="flex-row mt-8 gap-3">
        <TouchableOpacity
          onPress={onSave}
          disabled={isSaving}
          activeOpacity={0.7}
          className="bg-white px-6 py-3 rounded-full shadow-sm flex-row items-center justify-center min-w-[140px]"
          accessibilityRole="button"
          accessibilityLabel={isSaving ? "저장 중" : "번호 저장하기"}
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
    )}
  </View>
);

export const GenerationResult = memo(GenerationResultComponent);
