import { TransformInterceptor } from '../transform.interceptor';
import { of } from 'rxjs';
import { ExecutionContext, CallHandler } from '@nestjs/common';

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
    const mockExecutionContext = {} as ExecutionContext;

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
    const mockExecutionContext = {} as ExecutionContext;

    interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
      next: (response) => {
        expect(response.data).toBeNull();
        done();
      },
    });
  });
});
