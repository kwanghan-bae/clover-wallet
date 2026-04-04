jest.mock('../../utils/storage', () => ({
  loadItem: jest.fn(),
  saveItem: jest.fn(),
  removeItem: jest.fn(),
}));

import { loadItem } from '../../utils/storage';
import { addAuthHeader } from '../../api/client';

describe('API client interceptors', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('addAuthHeader', () => {
    it('should add Authorization header when token exists', () => {
      (loadItem as jest.Mock).mockReturnValue('test-token');
      const request = new Request('https://api.test.com');
      const result = addAuthHeader(request);
      expect(result.headers.get('Authorization')).toBe('Bearer test-token');
    });

    it('should not add header when no token', () => {
      (loadItem as jest.Mock).mockReturnValue(null);
      const request = new Request('https://api.test.com');
      const result = addAuthHeader(request);
      expect(result.headers.get('Authorization')).toBeNull();
    });
  });
});
