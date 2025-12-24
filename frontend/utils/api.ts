import { z } from 'zod';

/**
 * API 통신 관련 유틸리티
 */

/**
 * 백엔드 CommonResponse 스키마 (데이터 정합성 검증용)
 */
export const CommonResponseSchema = z.object({
  success: z.boolean().optional(),
  data: z.any(),
  message: z.string().optional(),
});

/**
 * 백엔드 CommonResponse 구조 ( { success: true, data: T, message: string } ) 에서
 * data 필드만 추출하여 반환하는 유틸리티
 */
export const unwrapCommonResponse = async (response: Response): Promise<Response> => {
  if (response.ok && response.headers.get('content-type')?.includes('application/json')) {
    const clonedResponse = response.clone();
    try {
      const body = await clonedResponse.json();
      
      // Zod로 스키마 검증
      const parsed = CommonResponseSchema.safeParse(body);
      if (parsed.success && 'data' in body) {
        return new Response(JSON.stringify(body.data), {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        });
      }
    } catch {
      // JSON parsing or validation failed
    }
  }
  return response;
};
