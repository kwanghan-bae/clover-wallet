import { useState, useRef } from 'react';
import { Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import TextRecognition from '@react-native-ml-kit/text-recognition';
import { parseLottoNumbers, parseLottoRound } from '../utils/ocr';
import { ticketsApi } from '../api/tickets';

/**
 * @description 로또 티켓 스캔 화면에서 필요한 카메라 권한, 촬영 및 OCR 인식 로직을 관리하는 커스텀 훅입니다.
 */
export function useScan() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanResult, setScanResult] = useState<{numbers: number[], round: number | null} | null>(null);
  const [scanMode, setScanMode] = useState<'ocr' | 'qr'>('qr');

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
          Alert.alert('인식 실패', '6개의 로또 번호를 찾을 수 없습니다. 다시 시도해주세요.');
        }
      }
    } catch (error) {
      console.error(error);
      Alert.alert('오류', 'OCR 처리 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (isProcessing) return;

    try {
      setIsProcessing(true);
      const ticket = await ticketsApi.scanTicket(data);
      const games = ticket.games ?? [];
      const numbers = games.length > 0
        ? [games[0].number1, games[0].number2, games[0].number3, games[0].number4, games[0].number5, games[0].number6]
        : [];
      const round = ticket.ordinal ?? null;

      if (numbers.length === 6) {
        setScanResult({ numbers, round });
      } else {
        Alert.alert('인식 실패', 'QR 코드에서 로또 번호를 찾을 수 없습니다. 다시 시도해주세요.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('오류', 'QR 스캔 처리 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetScan = () => setScanResult(null);

  return {
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
  };
}
