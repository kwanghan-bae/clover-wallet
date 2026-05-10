import React from 'react';
import { View, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { CameraView } from 'expo-camera';
import { useRouter, Stack } from 'expo-router';
import { Camera as CameraIcon, ChevronLeft } from 'lucide-react-native';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { useScan } from '../hooks/useScan';
import { ScanOverlay } from '../components/scan/ScanOverlay';
import { ScanResultView } from '../components/scan/ScanResultView';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { AppText } from '../components/ui/AppText';

/**
 * @description 로또 티켓의 QR 코드를 스캔하거나 번호를 OCR로 인식하여 자동으로 등록하는 화면입니다.
 */
const ScanScreen = () => {
  const router = useRouter();
  const {
    permission, requestPermission, cameraRef, isProcessing,
    scanResult, scanMode, setScanMode, handleCapture, handleBarCodeScanned, resetScan,
  } = useScan();

  if (!permission) return <View className="flex-1 bg-black" />;

  if (!permission.granted) {
    return (
      <View className="flex-1 bg-black items-center justify-center p-6">
        <AppText variant="body-lg" className="text-white text-center mb-6">
          카메라 접근 권한이 필요합니다
        </AppText>
        <PrimaryButton label="권한 허용" onPress={requestPermission} />
      </View>
    );
  }

  return (
    <ScreenContainer className="bg-black">
      <Stack.Screen options={{ headerShown: false }} />
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing="back"
        onBarcodeScanned={scanMode === 'qr' ? handleBarCodeScanned : undefined}
        barcodeScannerSettings={scanMode === 'qr' ? { barcodeTypes: ['qr'] } : undefined}
      >
        <ScanOverlay scanMode={scanMode} />
      </CameraView>

      {/* Top Header — always white-on-black over camera */}
      <View className="flex-row items-center px-2 h-14">
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityLabel="뒤로 가기"
          accessibilityRole="button"
          activeOpacity={0.7}
          className="w-10 h-10 items-center justify-center"
        >
          <ChevronLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View className="flex-1 items-center">
          <AppText variant="title" className="text-white">QR 스캔</AppText>
        </View>
        <View className="w-10 h-10" />
      </View>

      {/* Mode Toggle Tabs */}
      <View className="flex-row mx-4 mt-2 bg-black/50 rounded-md p-1">
        {(['qr', 'ocr'] as const).map((mode) => (
          <TouchableOpacity
            key={mode}
            className={`flex-1 py-2 rounded-md items-center ${scanMode === mode ? 'bg-primary' : ''}`}
            onPress={() => setScanMode(mode)}
            accessibilityRole="tab"
            accessibilityLabel={mode === 'qr' ? 'QR 스캔' : '번호 촬영'}
            accessibilityState={{ selected: scanMode === mode }}
          >
            <AppText
              variant="body"
              className={scanMode === mode ? 'text-white' : 'text-white/60'}
            >
              {mode === 'qr' ? 'QR 스캔' : '번호 촬영'}
            </AppText>
          </TouchableOpacity>
        ))}
      </View>

      {/* Bottom Controls */}
      <View className="absolute bottom-16 left-0 right-0 items-center">
        {!scanResult ? (
          scanMode === 'ocr' && (
            <TouchableOpacity
              onPress={handleCapture}
              disabled={isProcessing}
              className="bg-primary px-10 py-4 rounded-pill flex-row items-center shadow-button"
              accessibilityLabel={isProcessing ? "사진 촬영 처리 중" : "사진 촬영"}
              accessibilityRole="button"
              accessibilityState={{ disabled: isProcessing, busy: isProcessing }}
            >
              {isProcessing ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <>
                  <CameraIcon size={20} color="white" />
                  <AppText variant="title" className="text-white ml-3">촬영</AppText>
                </>
              )}
            </TouchableOpacity>
          )
        ) : (
          <ScanResultView result={scanResult} onRetry={resetScan} onConfirm={() => router.back()} />
        )}
        {scanMode === 'qr' && isProcessing && !scanResult && (
          <ActivityIndicator color="white" size="large" />
        )}
      </View>
    </ScreenContainer>
  );
};

export default ScanScreen;
