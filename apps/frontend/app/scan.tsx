import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet, ActivityIndicator } from 'react-native';
import { CameraView } from 'expo-camera';
import { useRouter, Stack } from 'expo-router';
import { X, Camera as CameraIcon } from 'lucide-react-native';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { useScan } from '../hooks/useScan';
import { ScanOverlay } from '../components/scan/ScanOverlay';
import { ScanResultView } from '../components/scan/ScanResultView';

const PRIMARY_COLOR = '#22C55E';

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
        <ScanOverlay scanMode={scanMode} />
      </CameraView>

      {/* Top Header */}
      <SafeAreaView className="absolute top-0 left-0 right-0">
        <View className="flex-row justify-between p-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-black/40 items-center justify-center"
            accessibilityLabel="스캔 화면 닫기"
            accessibilityRole="button"
          >
            <X size={24} color="white" />
          </TouchableOpacity>
        </View>
        {/* Mode Toggle Tabs */}
        <View style={styles.modeToggleContainer}>
          {(['qr', 'ocr'] as const).map((mode) => (
            <TouchableOpacity
              key={mode}
              style={[styles.modeTab, scanMode === mode && { backgroundColor: PRIMARY_COLOR }]}
              onPress={() => setScanMode(mode)}
              accessibilityRole="tab"
              accessibilityLabel={mode === 'qr' ? 'QR 스캔' : '번호 촬영'}
              accessibilityState={{ selected: scanMode === mode }}
            >
              <Text style={[styles.modeTabText, scanMode === mode && styles.modeTabTextActive]}>
                {mode === 'qr' ? 'QR 스캔' : '번호 촬영'}
              </Text>
            </TouchableOpacity>
          ))}
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
              accessibilityLabel={isProcessing ? "사진 촬영 처리 중" : "사진 촬영"}
              accessibilityRole="button"
              accessibilityState={{ disabled: isProcessing, busy: isProcessing }}
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
          <ScanResultView result={scanResult} onRetry={resetScan} onConfirm={() => router.back()} />
        )}
        {scanMode === 'qr' && isProcessing && !scanResult && (
          <ActivityIndicator color="white" size="large" />
        )}
      </View>
    </View>
  );
};

export default ScanScreen;

const styles = StyleSheet.create({
  modeToggleContainer: {
    flexDirection: 'row', marginHorizontal: 16, marginTop: 8,
    backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 12, padding: 4,
  },
  modeTab: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
  modeTabText: { color: 'rgba(255,255,255,0.6)', fontWeight: '600', fontSize: 14 },
  modeTabTextActive: { color: '#FFFFFF', fontWeight: '700' },
});
