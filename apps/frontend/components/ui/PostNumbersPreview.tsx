import React from 'react';
import { View } from 'react-native';
import { AppText } from './AppText';
import { BallRow } from './BallRow';

interface PostNumbersPreviewProps {
  games: { numbers: number[] }[];
  method?: string;
}

export const PostNumbersPreview: React.FC<PostNumbersPreviewProps> = ({ games, method }) => (
  <View className="bg-surface dark:bg-dark-card rounded-card-lg p-4 border border-border-hairline shadow-card mb-4">
    <AppText variant="caption" className="text-text-muted mb-3">
      추천 번호 ({games.length}게임)
    </AppText>
    <View className="gap-2">
      {games.map((g, i) => (
        <View key={i} className="flex-row items-center">
          {games.length > 1 ? (
            <AppText variant="label" className="text-text-muted w-6">{String.fromCharCode(65 + i)}</AppText>
          ) : null}
          <View className="flex-1">
            <BallRow numbers={g.numbers} />
          </View>
        </View>
      ))}
    </View>
    {method ? (
      <AppText variant="caption" className="text-text-muted mt-3">
        {method} 방식으로 생성
      </AppText>
    ) : null}
  </View>
);

PostNumbersPreview.displayName = 'PostNumbersPreview';
