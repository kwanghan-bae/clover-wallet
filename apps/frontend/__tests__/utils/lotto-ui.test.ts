import { getNumberColor } from '../../utils/lotto/ui';

describe('getNumberColor', () => {
  it('returns orange for numbers 1-10', () => {
    expect(getNumberColor(1)).toBe('bg-[#FFA726]');
    expect(getNumberColor(5)).toBe('bg-[#FFA726]');
    expect(getNumberColor(10)).toBe('bg-[#FFA726]');
  });

  it('returns blue for numbers 11-20', () => {
    expect(getNumberColor(11)).toBe('bg-[#42A5F5]');
    expect(getNumberColor(15)).toBe('bg-[#42A5F5]');
    expect(getNumberColor(20)).toBe('bg-[#42A5F5]');
  });

  it('returns red for numbers 21-30', () => {
    expect(getNumberColor(21)).toBe('bg-[#EF5350]');
    expect(getNumberColor(25)).toBe('bg-[#EF5350]');
    expect(getNumberColor(30)).toBe('bg-[#EF5350]');
  });

  it('returns grey for numbers 31-40', () => {
    expect(getNumberColor(31)).toBe('bg-[#9E9E9E]');
    expect(getNumberColor(35)).toBe('bg-[#9E9E9E]');
    expect(getNumberColor(40)).toBe('bg-[#9E9E9E]');
  });

  it('returns green for numbers 41-45', () => {
    expect(getNumberColor(41)).toBe('bg-[#66BB6A]');
    expect(getNumberColor(43)).toBe('bg-[#66BB6A]');
    expect(getNumberColor(45)).toBe('bg-[#66BB6A]');
  });
});
