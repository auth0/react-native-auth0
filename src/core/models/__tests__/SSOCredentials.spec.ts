import { SSOCredentials } from '../SSOCredentials';
import type { SSOCredentialsResponse } from '../../../types';

describe('SSOCredentials', () => {
  describe('constructor', () => {
    it('should correctly assign all properties from the input object', () => {
      const data = {
        sessionTransferToken: 'stt_token_123',
        tokenType: 'urn:auth0:params:oauth:token-type:session_transfer_token',
        expiresIn: 120,
        idToken: 'id_token_456',
        refreshToken: 'refresh_token_789',
      };

      const creds = new SSOCredentials(data);

      expect(creds.sessionTransferToken).toBe(data.sessionTransferToken);
      expect(creds.tokenType).toBe(data.tokenType);
      expect(creds.expiresIn).toBe(data.expiresIn);
      expect(creds.idToken).toBe(data.idToken);
      expect(creds.refreshToken).toBe(data.refreshToken);
    });

    it('should handle missing optional properties', () => {
      const data = {
        sessionTransferToken: 'stt_token_123',
        tokenType: 'urn:auth0:params:oauth:token-type:session_transfer_token',
        expiresIn: 120,
      };

      const creds = new SSOCredentials(data);

      expect(creds.idToken).toBeUndefined();
      expect(creds.refreshToken).toBeUndefined();
    });
  });

  describe('fromResponse', () => {
    it('should correctly map snake_case API response to camelCase properties', () => {
      const response: SSOCredentialsResponse = {
        access_token: 'stt_token_123',
        issued_token_type:
          'urn:auth0:params:oauth:token-type:session_transfer_token',
        token_type: 'N_A',
        expires_in: 120,
        id_token: 'id_token_456',
        refresh_token: 'refresh_token_789',
      };

      const creds = SSOCredentials.fromResponse(response);

      expect(creds).toBeInstanceOf(SSOCredentials);
      expect(creds.sessionTransferToken).toBe(response.access_token);
      expect(creds.tokenType).toBe(response.issued_token_type);
      expect(creds.expiresIn).toBe(response.expires_in);
      expect(creds.idToken).toBe(response.id_token);
      expect(creds.refreshToken).toBe(response.refresh_token);
    });

    it('should handle a response with no optional fields', () => {
      const response: SSOCredentialsResponse = {
        access_token: 'stt_token_123',
        issued_token_type:
          'urn:auth0:params:oauth:token-type:session_transfer_token',
        token_type: 'N_A',
        expires_in: 60,
      };

      const creds = SSOCredentials.fromResponse(response);

      expect(creds.idToken).toBeUndefined();
      expect(creds.refreshToken).toBeUndefined();
    });
  });
});
