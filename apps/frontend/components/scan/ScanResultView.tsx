import React, { memo } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { RotateCw } from 'lucide-react-native';
import { BallRow } from '../ui/BallRow';
import { AppText } from '../ui/AppText';

export interface ScanResultData {
  numbers: number[];
  round?: number;
}

export interface ScanResultViewProps {
  result: ScanResultData;
  onRetry: () => void;
  onConfirm: () => void;
}

/** @description 스캔 결과를 보여주는 카드 (번호 표시 + 확인/다시 촬영 버튼) */
const ScanResultViewComponent = ({ result, onRetry, onConfirm }: ScanResultViewProps) => (
  <View
    className="bg-surface dark:bg-dark-surface rounded-card-lg p-6 w-[90%] shadow-card"
    testID="scan-result"
  >
    <AppText
      variant="title-lg"
      className="text-text-primary dark:text-dark-text mb-2 text-center"
    >
      인식된 번호 확인
    </AppText>
    {result.round && (
      <AppText variant="title" className="text-primary text-center mb-4">
        {result.round}회차
      </AppText>
    )}
    <View className="items-center mb-6">
      <BallRow numbers={result.numbers} />
    </View>

    <View className="flex-row gap-3">
      <TouchableOpacity
        onPress={onRetry}
        className="flex-1 h-14 bg-surface-muted dark:bg-dark-card rounded-md items-center justify-center flex-row"
        accessibilityRole="button"
        accessibilityLabel="다시 촬영"
      >
        <RotateCw size={18} color="#6E7480" />
        <AppText
          variant="body-lg"
          className="text-text-muted dark:text-dark-text-secondary ml-2"
        >
          다시 촬영
        </AppText>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={onConfirm}
        className="flex-2 h-14 bg-primary rounded-md items-center justify-center"
        accessibilityRole="button"
        accessibilityLabel="확인"
      >
        <AppText variant="title" className="text-white px-8">
          확인
        </AppText>
      </TouchableOpacity>
    </View>
    <AppText variant="eyebrow" className="text-text-muted text-center mt-4">
      ※ 인식된 번호가 정확한지 확인해주세요.
    </AppText>
  </View>
);

export const ScanResultView = memo(ScanResultViewComponent);
