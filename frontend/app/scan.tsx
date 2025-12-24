import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet, Dimensions, ActivityIndicator, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter, Stack } from 'expo-router';
import { X, Camera as CameraIcon, RotateCw } from 'lucide-react-native';
import TextRecognition from '@react-native-ml-kit/text-recognition';
import { parseLottoNumbers, parseLottoRound } from '../utils/ocr';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { BallRow } from '../components/ui/BallRow';

const { width, height } = Dimensions.get('window');

export default function ScanScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanResult, setScanResult] = useState<{numbers: number[], round: number | null} | null>(null);

  if (!permission) {
    return <View className="flex-1 bg-black" />;
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 bg-black items-center justify-center p-6">
        <Text className="text-white text-center text-lg mb-6">We need your permission to show the camera</Text>
        <PrimaryButton label="Grant Permission" onPress={requestPermission} />
      </View>
    );
  }

  const handleCapture = async () => {
    if (!cameraRef.current || isProcessing) return;

    try {
      setIsProcessing(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });

      if (photo) {
        const result = await TextRecognition.recognize(photo.uri);
        const numbers = parseLottoNumbers(result.text);
        const round = parseLottoRound(result.text);

        if (numbers.length === 6) {
          setScanResult({ numbers, round });
        } else {
          Alert.alert('Detection Failed', 'Could not find 6 valid lotto numbers. Please try again.');
        }
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'An error occurred during OCR processing.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View className="flex-1 bg-black">
      <Stack.Screen options={{ headerShown: false }} />
      
      <CameraView 
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing="back"
      >
        {/* Overlay Guide */}
        <View style={styles.overlay}>
          <View style={styles.unfocusedContainer}></View>
          <View className="flex-row">
            <View style={styles.unfocusedContainer}></View>
            <View style={styles.focusedContainer}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
            <View style={styles.unfocusedContainer}></View>
          </View>
          <View style={styles.unfocusedContainer}>
            <Text className="text-white text-center mt-4">Align the lotto numbers inside the box</Text>
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
      </SafeAreaView>

      {/* Bottom Controls */}
      <View className="absolute bottom-12 left-0 right-0 items-center">
        {!scanResult ? (
          <TouchableOpacity 
            onPress={handleCapture}
            disabled={isProcessing}
            className="w-20 h-20 rounded-full bg-white/20 items-center justify-center border-4 border-white"
          >
            {isProcessing ? <ActivityIndicator color="white" size="large" /> : <CameraIcon size={32} color="white" />}
          </TouchableOpacity>
        ) : (
          <View className="bg-white rounded-3xl p-6 w-[90%] shadow-2xl">
            <Text className="text-xl font-bold text-text-dark mb-2 text-center">Numbers Recognized!</Text>
            {scanResult.round && <Text className="text-primary font-bold text-center mb-4">Round {scanResult.round}</Text>}
            <BallRow numbers={scanResult.numbers} className="mb-6" />
            
            <View className="flex-row gap-3">
              <TouchableOpacity 
                onPress={() => setScanResult(null)}
                className="flex-1 h-12 bg-gray-100 rounded-xl items-center justify-center flex-row"
              >
                <RotateCw size={18} color="#757575" className="mr-2" />
                <Text className="text-text-light font-bold">Retry</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => {
                  // TODO: Save to storage and go back
                  router.back();
                }}
                className="flex-2 h-12 bg-primary rounded-xl items-center justify-center"
              >
                <Text className="text-white font-bold text-lg px-8">Confirm & Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  unfocusedContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  focusedContainer: {
    width: width * 0.85,
    height: height * 0.25,
    borderWidth: 0,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: '#4CAF50',
    borderWidth: 4,
  },
  topLeft: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  topRight: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  bottomLeft: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  bottomRight: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },
});
