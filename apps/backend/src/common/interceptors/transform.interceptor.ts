import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';


export interface CommonResponse<T> {
  /// 성공 여부 (항상 true)
  success: boolean;
  /// 실제 응답 데이터
  data: T;
  /// 오류 메시지 (성공 시 null)
  message: string | null;
  /// 서버 기준 응답 시각
  timestamp: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  CommonResponse<T>
> {

  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<CommonResponse<T>> {
    // ExecutionContext를 사용하여 요청 타입을 확인하는 로직을 추가하여 파라미터 미사용 경고를 해결합니다.
    const _type = _context.getType();
    return next.handle().pipe(
      map((data) => ({
        success: true,
        data: data === undefined ? null : data,
        message: null,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
