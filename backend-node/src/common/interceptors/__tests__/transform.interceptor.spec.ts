import { TransformInterceptor } from '../transform.interceptor';
import { of } from 'rxjs';
import { ExecutionContext, CallHandler } from '@nestjs/common';

/**
 * TransformInterceptor에 대한 단위 테스트입니다.
 * 모든 성공 응답을 표준 CommonResponse 형식으로 변환하는 로직을 검증합니다.
 */
describe('TransformInterceptor', () => {
  let interceptor: TransformInterceptor<any>;

  beforeEach(() => {
    interceptor = new TransformInterceptor();
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should transform response to CommonResponse format', (done) => {
    const mockData = { id: 1, name: 'test' };
    const mockCallHandler: CallHandler = {
      handle: () => of(mockData),
    };
    const mockExecutionContext = {
      getType: jest.fn().mockReturnValue('http'),
    } as any;

    interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
      next: (response) => {
        expect(response.success).toBe(true);
        expect(response.data).toEqual(mockData);
        expect(response.message).toBeNull();
        expect(response.timestamp).toBeDefined();
        done();
      },
    });
  });

  it('should handle undefined data by setting it to null', (done) => {
    const mockCallHandler: CallHandler = {
      handle: () => of(undefined),
    };
    const mockExecutionContext = {
      getType: jest.fn().mockReturnValue('http'),
    } as any;

    interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
      next: (response) => {
        expect(response.data).toBeNull();
        done();
      },
    });
  });
});
