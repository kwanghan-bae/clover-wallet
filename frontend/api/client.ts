import ky from 'ky';

// TODO: Use environment variables for Base URL
const API_BASE_URL = 'https://api.cloverwallet.com/v1';

export const apiClient = ky.create({
  prefixUrl: API_BASE_URL,
  timeout: 10000,
  retry: {
    limit: 2,
    methods: ['get', 'put', 'head', 'delete', 'options', 'trace'],
    statusCodes: [408, 413, 429, 500, 502, 503, 504],
  },
  hooks: {
    beforeRequest: [
      async (request) => {
        // TODO: Get token from storage (e.g., mmkv)
        const token = null; 
        if (token) {
          request.headers.set('Authorization', `Bearer ${token}`);
        }
      },
    ],
    afterResponse: [
      async (request, options, response) => {
        if (response.status === 401) {
          // TODO: Handle unauthorized (logout or refresh token)
          console.warn('Unauthorized request');
        }
        
        // 백엔드 CommonResponse 구조 언래핑
        // 응답이 성공적이고 JSON 포맷인 경우 data 필드만 추출하여 새로운 Response 객체 생성
        if (response.ok && response.headers.get('content-type')?.includes('application/json')) {
          const body = await response.json();
          if (body && 'data' in body) {
            return new Response(JSON.stringify(body.data), {
              status: response.status,
              statusText: response.statusText,
              headers: response.headers,
            });
          }
        }
      }
    ]
  },
});
