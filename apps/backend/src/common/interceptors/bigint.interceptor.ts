import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class BigIntInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<any> {
    // ExecutionContext를 사용하여 요청 타입을 확인하는 로직을 추가하여 파라미터 미사용 경고를 해결합니다.
    const _type = _context.getType();
    return next.handle().pipe(
      map((data) => {
        return this.transformBigInt(data);
      }),
    );
  }

  private transformBigInt(data: any): any {
    if (data === null || data === undefined) {
      return data;
    }

    if (typeof data === 'bigint') {
      return data.toString();
    }

    // 어떤 객체든 toJSON()이 정의되어 있으면 JSON.stringify가 자동으로 호출하므로
    // 우리가 재구성하지 않고 그대로 통과시킨다 (Date, Decimal, Big.js 등 커버).
    if (
      typeof data === 'object' &&
      data !== null &&
      typeof (data as { toJSON?: unknown }).toJSON === 'function'
    ) {
      return data;
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
