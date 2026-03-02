import { cn } from '../utils/cn';

/**
 * cn 유틸리티 테스트 스위트
 * 
 * 목적: 여러 클래스 이름을 조건부로 결합하고, Tailwind CSS의 클래스 충돌을 
 * twMerge를 통해 올바르게 해결하는지 검증합니다.
 */
describe('cn utility', () => {
  test('should merge class names correctly', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2');
  });

  test('should handle conditional classes', () => {
    expect(cn('class1', true && 'class2', false && 'class3')).toBe('class1 class2');
  });

  test('should merge tailwind classes using twMerge', () => {
    // p-4 and p-8 should be merged to p-8
    const result = cn('p-4', 'p-8');
    expect(result).toContain('p-8');
    expect(result).not.toContain('p-4');
  });
});
