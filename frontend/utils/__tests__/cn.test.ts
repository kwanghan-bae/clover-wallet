import { cn } from '../cn';

describe('cn', () => {
  test('should merge classes correctly', () => {
    expect(cn('bg-red-500', 'text-white')).toBe('bg-red-500 text-white');
  });

  test('should handle conditional classes', () => {
    expect(cn('bg-red-500', false && 'text-white', 'p-4')).toBe('bg-red-500 p-4');
    expect(cn('bg-red-500', true && 'text-white', 'p-4')).toBe('bg-red-500 text-white p-4');
  });

  test('should handle arrays and objects (clsx behavior)', () => {
    expect(cn(['bg-red-500', 'text-white'])).toBe('bg-red-500 text-white');
    expect(cn({ 'bg-red-500': true, 'text-white': false })).toBe('bg-red-500');
  });

  test('should merge tailwind conflicts correctly (tailwind-merge behavior)', () => {
    expect(cn('p-4', 'p-8')).toBe('p-8');
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
  });
});
