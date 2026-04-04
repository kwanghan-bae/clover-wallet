// frontend/api/client.ts
import ky from 'ky';
import { loadItem, saveItem, removeItem } from '../utils/storage';
import { unwrapCommonResponse } from '../utils/api';

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  'https://clover-wallet-api-node.onrender.com/api/v1';

export function addAuthHeader(request: Request): Request {
  const token = loadItem<string>('auth.access_token');
  if (token) {
    request.headers.set('Authorization', `Bearer ${token}`);
  }
  return request;
}

export async function handleTokenRefresh(
  request: Request,
  _options: unknown,
  response: Response,
): Promise<Response> {
  if (response.status === 401) {
    const refreshToken = loadItem<string>('auth.refresh_token');
    if (refreshToken) {
      try {
        const refreshResponse = await ky
          .post(`${API_BASE_URL}/auth/refresh`, {
            json: { refreshToken },
          })
          .json<{ accessToken: string }>();
        saveItem('auth.access_token', refreshResponse.accessToken);
        request.headers.set('Authorization', `Bearer ${refreshResponse.accessToken}`);
        return ky(request);
      } catch {
        removeItem('auth.access_token');
        removeItem('auth.refresh_token');
        removeItem('user.profile');
      }
    }
  }
  return response;
}

export const apiClient = ky.create({
  prefixUrl: API_BASE_URL,
  timeout: 10000,
  retry: {
    limit: 2,
    methods: ['get', 'put', 'head', 'delete', 'options', 'trace'],
    statusCodes: [408, 413, 429, 500, 502, 503, 504],
  },
  hooks: {
    beforeRequest: [(request) => addAuthHeader(request)],
    afterResponse: [handleTokenRefresh, unwrapCommonResponse],
  },
});
