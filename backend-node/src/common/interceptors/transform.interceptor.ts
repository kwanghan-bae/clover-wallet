import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Kotlin의 CommonResponse와 규격을 맞추기 위해 모든 성공 응답을 변환하는 인터셉터입니다.
 */
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
export class TransformInterceptor<T>
  implements NestInterceptor<T, CommonResponse<T>>
{
  /**
   * 응답 스트림을 가로채서 표준 CommonResponse 형식으로 변환합니다.
   * @param context 실행 컨텍스트
   * @param next 다음 처리 핸들러
   * @returns 변환된 응답 스트림
   */
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<CommonResponse<T>> {
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
