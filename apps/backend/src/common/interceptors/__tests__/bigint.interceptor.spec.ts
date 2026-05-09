import { BigIntInterceptor } from '../bigint.interceptor';
import { of } from 'rxjs';
import { CallHandler } from '@nestjs/common';

/**
 * BigIntInterceptor에 대한 단위 테스트입니다.
 * 응답 데이터 내의 BigInt 값을 문자열로 올바르게 변환하는지 검증합니다.
 */
describe('BigIntInterceptor', () => {
  let interceptor: BigIntInterceptor;

  beforeEach(() => {
    interceptor = new BigIntInterceptor();
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should transform BigInt to string in object', (done) => {
    const mockData = { id: BigInt(1), value: 100 };
    const mockCallHandler: CallHandler = {
      handle: () => of(mockData),
    };
    const mockExecutionContext = {
      getType: jest.fn().mockReturnValue('http'),
    } as any;

    interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
      next: (response) => {
        expect(response.id).toBe('1');
        expect(response.value).toBe(100);
        done();
      },
    });
  });

  it('should transform BigInt to string in array', (done) => {
    const mockData = [BigInt(1), BigInt(2)];
    const mockCallHandler: CallHandler = {
      handle: () => of(mockData),
    };
    const mockExecutionContext = {
      getType: jest.fn().mockReturnValue('http'),
    } as any;

    interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
      next: (response) => {
        expect(response).toEqual(['1', '2']);
        done();
      },
    });
  });

  it('should handle nested objects', (done) => {
    const mockData = {
      user: { id: BigInt(123) },
      scores: [BigInt(10), { point: BigInt(20) }],
    };
    const mockCallHandler: CallHandler = {
      handle: () => of(mockData),
    };
    const mockExecutionContext = {
      getType: jest.fn().mockReturnValue('http'),
    } as any;

    interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
      next: (response) => {
        expect(response.user.id).toBe('123');
        expect(response.scores[0]).toBe('10');
        expect(response.scores[1].point).toBe('20');
        done();
      },
    });
  });

  it('Date 인스턴스는 그대로 통과시킴 (toJSON으로 ISO 문자열 직렬화 보장)', (done) => {
    const date = new Date('2025-01-15T10:30:00.000Z');
    const mockCallHandler: CallHandler = {
      handle: () => of({ createdAt: date, items: [{ updatedAt: date }] }),
    };
    const mockExecutionContext = {
      getType: jest.fn().mockReturnValue('http'),
    } as any;

    interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
      next: (response: any) => {
        expect(response.createdAt).toBeInstanceOf(Date);
        expect(response.createdAt.getTime()).toBe(date.getTime());
        expect(response.items[0].updatedAt).toBeInstanceOf(Date);
        expect(JSON.stringify(response)).toContain('2025-01-15T10:30:00.000Z');
        done();
      },
    });
  });

  it('toJSON 메서드를 가진 임의 객체도 그대로 통과 (Date, Decimal 등 미래 타입 호환)', (done) => {
    // Decimal-like custom value object
    class FakeDecimal {
      constructor(public value: string) {}
      toJSON() {
        return this.value;
      }
    }
    const dec = new FakeDecimal('123.45');
    const mockCallHandler: CallHandler = {
      handle: () => of({ price: dec }),
    };
    const mockExecutionContext = {
      getType: jest.fn().mockReturnValue('http'),
    } as any;

    interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
      next: (response: any) => {
        expect(response.price).toBeInstanceOf(FakeDecimal);
        expect(response.price.toJSON()).toBe('123.45');
        expect(JSON.stringify(response)).toContain('"123.45"');
        done();
      },
    });
  });
});
