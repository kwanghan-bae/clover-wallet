import ky from 'ky';
import { unwrapCommonResponse } from '../utils/api';

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
