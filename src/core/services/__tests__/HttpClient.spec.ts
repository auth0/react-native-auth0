import { HttpClient, getBearerHeader } from '../HttpClient';

// Mock the telemetry module
jest.mock('../../utils/telemetry', () => ({
  telemetry: { name: 'test', version: '1.0.0' },
}));

describe('HttpClient', () => {
  const baseUrl = 'https://test.auth0.com';
  let httpClient: HttpClient;

  beforeEach(() => {
    httpClient = new HttpClient({ baseUrl });
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getBearerHeader', () => {
    it('should return Bearer header', () => {
      const result = getBearerHeader('test-token');
      expect(result).toEqual({ Authorization: 'Bearer test-token' });
    });
  });

  describe('safeJson - WWW-Authenticate header parsing', () => {
    it('should parse error from WWW-Authenticate header on 401 response', async () => {
      const mockResponse = {
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        text: jest.fn().mockResolvedValue(''),
        headers: new Map([
          [
            'WWW-Authenticate',
            'Bearer error="invalid_token", error_description="The access token expired"',
          ],
        ]) as unknown as Headers,
      } as unknown as Response;
      mockResponse.headers.get = jest.fn((name: string) => {
        if (name === 'WWW-Authenticate') {
          return 'Bearer error="invalid_token", error_description="The access token expired"';
        }
        return null;
      });

      global.fetch = jest.fn().mockResolvedValue(mockResponse);

      const { json } = await httpClient.get('/userinfo');

      expect(json).toEqual({
        error: 'invalid_token',
        error_description: 'The access token expired',
      });
    });

    it('should parse error without description from WWW-Authenticate header', async () => {
      const mockResponse = {
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        text: jest.fn().mockResolvedValue(''),
        headers: new Map([
          ['WWW-Authenticate', 'Bearer error="invalid_token"'],
        ]) as unknown as Headers,
      } as unknown as Response;
      mockResponse.headers.get = jest.fn((name: string) => {
        if (name === 'WWW-Authenticate') {
          return 'Bearer error="invalid_token"';
        }
        return null;
      });

      global.fetch = jest.fn().mockResolvedValue(mockResponse);

      const { json } = await httpClient.get('/userinfo');

      expect(json).toEqual({
        error: 'invalid_token',
        error_description: undefined,
      });
    });

    it('should fallback to http_error_401 when WWW-Authenticate has no error', async () => {
      const mockResponse = {
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        text: jest.fn().mockResolvedValue(''),
        headers: new Map([
          ['WWW-Authenticate', 'Bearer'],
        ]) as unknown as Headers,
      } as unknown as Response;
      mockResponse.headers.get = jest.fn((name: string) => {
        if (name === 'WWW-Authenticate') {
          return 'Bearer';
        }
        return null;
      });

      global.fetch = jest.fn().mockResolvedValue(mockResponse);

      const { json } = await httpClient.get('/userinfo');

      expect(json).toEqual({
        error: 'http_error_401',
        error_description: 'Unauthorized',
      });
    });

    it('should fallback to http_error when no WWW-Authenticate header', async () => {
      const mockResponse = {
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        text: jest.fn().mockResolvedValue('Access denied'),
        headers: new Map() as unknown as Headers,
      } as unknown as Response;
      mockResponse.headers.get = jest.fn(() => null);

      global.fetch = jest.fn().mockResolvedValue(mockResponse);

      const { json } = await httpClient.get('/some-endpoint');

      expect(json).toEqual({
        error: 'http_error_403',
        error_description: 'Access denied',
      });
    });

    it('should use statusText when response body is empty', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: jest.fn().mockResolvedValue(''),
        headers: new Map() as unknown as Headers,
      } as unknown as Response;
      mockResponse.headers.get = jest.fn(() => null);

      global.fetch = jest.fn().mockResolvedValue(mockResponse);

      const { json } = await httpClient.get('/some-endpoint');

      expect(json).toEqual({
        error: 'http_error_500',
        error_description: 'Internal Server Error',
      });
    });

    it('should return invalid_json for successful response with invalid JSON', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        text: jest.fn().mockResolvedValue('not valid json'),
        headers: new Map() as unknown as Headers,
      } as unknown as Response;
      mockResponse.headers.get = jest.fn(() => null);

      global.fetch = jest.fn().mockResolvedValue(mockResponse);

      const { json } = await httpClient.get('/some-endpoint');

      expect(json).toEqual({
        error: 'invalid_json',
        error_description: 'not valid json',
      });
    });

    it('should parse valid JSON response correctly', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        text: jest
          .fn()
          .mockResolvedValue('{"sub": "user123", "name": "Test User"}'),
        headers: new Map() as unknown as Headers,
      } as unknown as Response;
      mockResponse.headers.get = jest.fn(() => null);

      global.fetch = jest.fn().mockResolvedValue(mockResponse);

      const { json } = await httpClient.get('/userinfo');

      expect(json).toEqual({
        sub: 'user123',
        name: 'Test User',
      });
    });

    it('should return empty object for 204 No Content', async () => {
      const mockResponse = {
        ok: true,
        status: 204,
        statusText: 'No Content',
        text: jest.fn(),
        headers: new Map() as unknown as Headers,
      } as unknown as Response;
      mockResponse.headers.get = jest.fn(() => null);

      global.fetch = jest.fn().mockResolvedValue(mockResponse);

      const { json } = await httpClient.get('/some-endpoint');

      expect(json).toEqual({});
      expect(mockResponse.text).not.toHaveBeenCalled();
    });

    it('should parse JSON error response from body when available', async () => {
      const mockResponse = {
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        text: jest
          .fn()
          .mockResolvedValue(
            '{"error": "invalid_request", "error_description": "Missing parameter"}'
          ),
        headers: new Map() as unknown as Headers,
      } as unknown as Response;
      mockResponse.headers.get = jest.fn(() => null);

      global.fetch = jest.fn().mockResolvedValue(mockResponse);

      const { json } = await httpClient.get('/oauth/token');

      expect(json).toEqual({
        error: 'invalid_request',
        error_description: 'Missing parameter',
      });
    });

    it('should handle insufficient_scope error in WWW-Authenticate', async () => {
      const mockResponse = {
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        text: jest.fn().mockResolvedValue(''),
        headers: new Map() as unknown as Headers,
      } as unknown as Response;
      mockResponse.headers.get = jest.fn((name: string) => {
        if (name === 'WWW-Authenticate') {
          return 'Bearer error="insufficient_scope", error_description="The request requires higher privileges"';
        }
        return null;
      });

      global.fetch = jest.fn().mockResolvedValue(mockResponse);

      const { json } = await httpClient.get('/api/admin');

      expect(json).toEqual({
        error: 'insufficient_scope',
        error_description: 'The request requires higher privileges',
      });
    });

    it('should handle invalid_request error in WWW-Authenticate', async () => {
      const mockResponse = {
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        text: jest.fn().mockResolvedValue(''),
        headers: new Map() as unknown as Headers,
      } as unknown as Response;
      mockResponse.headers.get = jest.fn((name: string) => {
        if (name === 'WWW-Authenticate') {
          return 'Bearer error="invalid_request", error_description="The request is missing a required parameter"';
        }
        return null;
      });

      global.fetch = jest.fn().mockResolvedValue(mockResponse);

      const { json } = await httpClient.get('/userinfo');

      expect(json).toEqual({
        error: 'invalid_request',
        error_description: 'The request is missing a required parameter',
      });
    });

    it('should use text body as description when WWW-Authenticate is not present', async () => {
      const mockResponse = {
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        text: jest.fn().mockResolvedValue('Token has expired'),
        headers: new Map() as unknown as Headers,
      } as unknown as Response;
      mockResponse.headers.get = jest.fn(() => null);

      global.fetch = jest.fn().mockResolvedValue(mockResponse);

      const { json } = await httpClient.get('/userinfo');

      expect(json).toEqual({
        error: 'http_error_401',
        error_description: 'Token has expired',
      });
    });
  });
});
