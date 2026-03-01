import ky from 'ky';
import { unwrapCommonResponse } from '../utils/api';

// Node.js(NestJS) 기반의 새로운 백엔드 서버 주소입니다.
// Expo 환경변수(EXPO_PUBLIC_API_URL)가 있으면 우선적으로 사용합니다.
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://clover-wallet-api-node.onrender.com/api/v1';

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
        // Token logic will be implemented with auth storage
      },
    ],
    afterResponse: [
      async (request, options, response) => {
        if (response.status === 401) {
          console.warn('Unauthorized request');
        }
        return unwrapCommonResponse(response);
      }
    ]
  },
});
