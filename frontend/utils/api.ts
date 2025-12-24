/**
 * API 통신 관련 유틸리티
 */

/**
 * 백엔드 CommonResponse 구조 ( { success: true, data: T, message: string } ) 에서
 * data 필드만 추출하여 반환하는 유틸리티
 */
export const unwrapCommonResponse = async (response: Response): Promise<Response> => {
  if (response.ok && response.headers.get('content-type')?.includes('application/json')) {
    // Response body can only be read once.
    const clonedResponse = response.clone();
    try {
      const body = await clonedResponse.json();
      if (body && 'data' in body) {
        return new Response(JSON.stringify(body.data), {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        });
      }
    } catch (e) {
      // JSON parsing failed, return original response
    }
  }
  return response;
};
