import { unwrapCommonResponse } from '../utils/api';

describe('API Utilities', () => {
  test('unwrapCommonResponse should extract data field from JSON response', async () => {
    const mockData = { id: 1, name: 'Test' };
    const mockBody = { success: true, data: mockData, message: 'OK' };
    
    const mockResponse = {
      ok: true,
      headers: {
        get: (name: string) => name === 'content-type' ? 'application/json' : null
      },
      clone: function() { return this; },
      json: async () => mockBody,
      status: 200,
      statusText: 'OK',
    } as any;

    const result = await unwrapCommonResponse(mockResponse);
    const resultJson = await result.json();

    expect(resultJson).toEqual(mockData);
  });

  test('unwrapCommonResponse should return original response if not JSON', async () => {
    const mockResponse = {
      ok: true,
      headers: {
        get: (name: string) => name === 'content-type' ? 'text/plain' : null
      },
      clone: function() { return this; },
      status: 200,
    } as any;

    const result = await unwrapCommonResponse(mockResponse);
    expect(result).toBe(mockResponse);
  });
});