import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { CameraView } from 'expo-camera';
import { useRouter, Stack } from 'expo-router';
import { X, Camera as CameraIcon, RotateCw } from 'lucide-react-native';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { BallRow } from '../components/ui/BallRow';
import { useScan } from '../hooks/useScan';

const { width, height } = Dimensions.get('window');

const PRIMARY_COLOR = '#22C55E';

/**
 * @description 로또 티켓의 QR 코드를 스캔하거나 번호를 OCR로 인식하여 자동으로 등록하는 화면입니다.
 */
const ScanScreen = () => {
  const router = useRouter();
  const {
    permission,
    requestPermission,
    cameraRef,
    isProcessing,
    scanResult,
    scanMode,
    setScanMode,
    handleCapture,
    handleBarCodeScanned,
    resetScan,
  } = useScan();

  if (!permission) {
    return <View className="flex-1 bg-black" />;
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 bg-black items-center justify-center p-6">
        <Text className="text-white text-center text-lg mb-6">카메라 접근 권한이 필요합니다</Text>
        <PrimaryButton label="권한 허용" onPress={requestPermission} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <Stack.Screen options={{ headerShown: false }} />

      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing="back"
        onBarcodeScanned={scanMode === 'qr' ? handleBarCodeScanned : undefined}
        barcodeScannerSettings={scanMode === 'qr' ? { barcodeTypes: ['qr'] } : undefined}
      >
        {/* Full Screen Overlay with centered hole */}
        <View style={styles.overlay}>
          <View style={styles.unfocusedContainer} />
          <View className="flex-row">
            <View style={styles.unfocusedContainer} />
            <View style={styles.focusedContainer}>
              {/* Custom Corner Markers matching Flutter's ScanOverlayPainter */}
              <View style={[styles.corner, styles.topLeft, { borderLeftWidth: 5, borderTopWidth: 5 }]} />
              <View style={[styles.corner, styles.topRight, { borderRightWidth: 5, borderTopWidth: 5 }]} />
              <View style={[styles.corner, styles.bottomLeft, { borderLeftWidth: 5, borderBottomWidth: 5 }]} />
              <View style={[styles.corner, styles.bottomRight, { borderRightWidth: 5, borderBottomWidth: 5 }]} />
            </View>
            <View style={styles.unfocusedContainer} />
          </View>
          <View style={styles.unfocusedContainer}>
            <Text className="text-white text-center mt-8 px-10 text-sm leading-5">
              {scanMode === 'qr'
                ? '로또 티켓의 QR 코드를 가이드에 맞춰주세요'
                : '로또 티켓의 번호 부분을 가이드에 맞춰주세요'}
            </Text>
          </View>
        </View>
      </CameraView>

      {/* Top Header */}
      <SafeAreaView className="absolute top-0 left-0 right-0">
        <View className="flex-row justify-between p-4">
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-black/40 items-center justify-center">
            <X size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Mode Toggle Tabs */}
        <View style={styles.modeToggleContainer}>
          <TouchableOpacity
            style={[styles.modeTab, scanMode === 'qr' && { backgroundColor: PRIMARY_COLOR }]}
            onPress={() => setScanMode('qr')}
          >
            <Text style={[styles.modeTabText, scanMode === 'qr' && styles.modeTabTextActive]}>QR 스캔</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeTab, scanMode === 'ocr' && { backgroundColor: PRIMARY_COLOR }]}
            onPress={() => setScanMode('ocr')}
          >
            <Text style={[styles.modeTabText, scanMode === 'ocr' && styles.modeTabTextActive]}>번호 촬영</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Bottom Controls */}
      <View className="absolute bottom-16 left-0 right-0 items-center">
        {!scanResult ? (
          scanMode === 'ocr' && (
            <TouchableOpacity
              onPress={handleCapture}
              disabled={isProcessing}
              className="bg-primary px-10 py-4 rounded-full flex-row items-center shadow-2xl"
            >
              {isProcessing ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <>
                  <CameraIcon size={20} color="white" />
                  <Text className="text-white font-black text-lg ml-3">촬영</Text>
                </>
              )}
            </TouchableOpacity>
          )
        ) : (
          <View className="bg-white dark:bg-dark-surface rounded-3xl p-6 w-[90%] shadow-2xl">
            <Text className="text-xl font-bold text-text-dark dark:text-dark-text mb-2 text-center">인식된 번호 확인</Text>
            {scanResult.round && <Text className="text-primary font-bold text-center mb-4">{scanResult.round}회차</Text>}
            <View className="items-center mb-6">
              <BallRow numbers={scanResult.numbers} />
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={resetScan}
                className="flex-1 h-14 bg-gray-100 dark:bg-dark-card rounded-xl items-center justify-center flex-row"
              >
                <RotateCw size={18} color="#757575" />
                <Text className="text-text-light dark:text-dark-text-secondary font-bold ml-2">다시 촬영</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  router.back();
                }}
                className="flex-2 h-14 bg-primary rounded-xl items-center justify-center"
              >
                <Text className="text-white font-bold text-lg px-8">확인</Text>
              </TouchableOpacity>
            </View>
            <Text className="text-gray-400 text-[10px] text-center mt-4">※ 인식된 번호가 정확한지 확인해주세요.</Text>
          </View>
        )}
        {scanMode === 'qr' && isProcessing && !scanResult && (
          <ActivityIndicator color="white" size="large" />
        )}
      </View>
    </View>
  );
};

export default ScanScreen;

/** 스캔 화면의 레이아웃과 오버레이 스타일을 정의합니다. */
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  unfocusedContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  focusedContainer: {
    width: width * 0.8,
    height: height * 0.2,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 25,
    height: 25,
    borderColor: '#FFFFFF',
  },
  topLeft: { top: -2, left: -2 },
  topRight: { top: -2, right: -2 },
  bottomLeft: { bottom: -2, left: -2 },
  bottomRight: { bottom: -2, right: -2 },
  modeToggleContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    padding: 4,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  modeTabText: {
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
    fontSize: 14,
  },
  modeTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
