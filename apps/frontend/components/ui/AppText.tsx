import React from 'react';
import { Text, TextProps, StyleProp, TextStyle, StyleSheet } from 'react-native';

export type AppTextVariant =
  | 'display'
  | 'title-lg'
  | 'title'
  | 'body-lg'
  | 'body'
  | 'caption'
  | 'label'
  | 'eyebrow';

interface AppTextProps extends TextProps {
  variant?: AppTextVariant;
  className?: string;
}

const VARIANTS: Record<AppTextVariant, TextStyle> = {
  display:    { fontFamily: 'NotoSansKR_800ExtraBold', fontSize: 30, letterSpacing: -1.2 },
  'title-lg': { fontFamily: 'NotoSansKR_800ExtraBold', fontSize: 20, letterSpacing: -0.4 },
  title:      { fontFamily: 'NotoSansKR_800ExtraBold', fontSize: 16, letterSpacing: -0.2 },
  'body-lg':  { fontFamily: 'NotoSansKR_600SemiBold', fontSize: 15, letterSpacing: -0.1 },
  body:       { fontFamily: 'NotoSansKR_500Medium', fontSize: 13, letterSpacing: 0 },
  caption:    { fontFamily: 'NotoSansKR_600SemiBold', fontSize: 12, letterSpacing: 0 },
  label:      { fontFamily: 'NotoSansKR_700Bold', fontSize: 11, letterSpacing: 0 },
  eyebrow:    { fontFamily: 'NotoSansKR_700Bold', fontSize: 10, letterSpacing: 1.4 },
};

export const AppText: React.FC<AppTextProps> = ({
  variant = 'body',
  style,
  ...rest
}) => {
  const variantStyle = VARIANTS[variant];
  const merged: StyleProp<TextStyle> = StyleSheet.flatten([variantStyle, style]);
  return <Text {...rest} style={merged} />;
};

AppText.displayName = 'AppText';
