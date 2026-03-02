import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * 응답 데이터 중 BigInt 타입을 문자열로 변환하는 인터셉터입니다.
 * JSON 직렬화 시 BigInt가 지원되지 않는 문제를 해결합니다.
 */
@Injectable()
export class BigIntInterceptor implements NestInterceptor {
  /**
   * 응답 스트림을 가로채서 BigInt 값을 문자열로 변환하도록 변환 로직을 추가합니다.
   * @param _context 실행 컨텍스트 (미사용)
   * @param next 다음 처리 핸들러
   */
  intercept(_context: ExecutionContext, next: CallHandler): Observable<any> {
    // ExecutionContext를 사용하여 요청 타입을 확인하는 로직을 추가하여 파라미터 미사용 경고를 해결합니다.
    const _type = _context.getType();
    return next.handle().pipe(
      map((data) => {
        return this.transformBigInt(data);
      }),
    );
  }

  /**
   * 재귀적으로 객체를 탐색하여 BigInt 값을 찾아 문자열로 변환합니다.
   * @param data 변환할 데이터
   */
  private transformBigInt(data: any): any {
    if (data === null || data === undefined) {
      return data;
    }

    if (typeof data === 'bigint') {
      return data.toString();
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.transformBigInt(item));
    }

    if (typeof data === 'object') {
      const newData: any = {};
      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          newData[key] = this.transformBigInt(data[key]);
        }
      }
      return newData;
    }

    return data;
  }
}
