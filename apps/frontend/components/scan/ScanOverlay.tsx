import React, { memo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { AppText } from '../ui/AppText';

const { width, height } = Dimensions.get('window');

export interface ScanOverlayProps {
  scanMode: 'qr' | 'ocr';
}

/** @description 카메라 뷰 위에 표시되는 스캔 오버레이 (코너 마커 + 가이드 텍스트) */
const ScanOverlayComponent = ({ scanMode }: ScanOverlayProps) => (
  <View style={styles.overlay}>
    <View style={styles.unfocusedContainer} />
    <View className="flex-row">
      <View style={styles.unfocusedContainer} />
      <View style={styles.focusedContainer}>
        <View style={[styles.corner, styles.topLeft, { borderLeftWidth: 5, borderTopWidth: 5 }]} />
        <View style={[styles.corner, styles.topRight, { borderRightWidth: 5, borderTopWidth: 5 }]} />
        <View style={[styles.corner, styles.bottomLeft, { borderLeftWidth: 5, borderBottomWidth: 5 }]} />
        <View style={[styles.corner, styles.bottomRight, { borderRightWidth: 5, borderBottomWidth: 5 }]} />
      </View>
      <View style={styles.unfocusedContainer} />
    </View>
    <View style={styles.unfocusedContainer}>
      <AppText variant="body" className="text-white text-center mt-8 px-10">
        {scanMode === 'qr'
          ? '로또 티켓의 QR 코드를 가이드에 맞춰주세요'
          : '로또 티켓의 번호 부분을 가이드에 맞춰주세요'}
      </AppText>
    </View>
  </View>
);

export const ScanOverlay = memo(ScanOverlayComponent);

const styles = StyleSheet.create({
  overlay: { flex: 1 },
  unfocusedContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  focusedContainer: {
    width: width * 0.8,
    height: height * 0.2,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    position: 'relative',
  },
  corner: { position: 'absolute', width: 25, height: 25, borderColor: '#FFFFFF' },
  topLeft: { top: -2, left: -2 },
  topRight: { top: -2, right: -2 },
  bottomLeft: { bottom: -2, left: -2 },
  bottomRight: { bottom: -2, right: -2 },
});
