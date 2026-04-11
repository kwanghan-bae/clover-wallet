import React from 'react';
import { render } from '@testing-library/react-native';
import { ScanOverlay } from '../../../components/scan/ScanOverlay';

function hasText(json: any, text: string): boolean {
  return JSON.stringify(json).includes(text);
}

describe('ScanOverlay', () => {
  /** QR 모드에서 올바른 가이드 텍스트를 표시합니다 */
  test('QR 모드 가이드 텍스트를 표시한다', () => {
    const { toJSON } = render(
      React.createElement(ScanOverlay, { scanMode: 'qr' })
    );
    expect(hasText(toJSON(), 'QR 코드를 가이드에 맞춰주세요')).toBe(true);
  });

  /** OCR 모드에서 올바른 가이드 텍스트를 표시합니다 */
  test('OCR 모드 가이드 텍스트를 표시한다', () => {
    const { toJSON } = render(
      React.createElement(ScanOverlay, { scanMode: 'ocr' })
    );
    expect(hasText(toJSON(), '번호 부분을 가이드에 맞춰주세요')).toBe(true);
  });
});
