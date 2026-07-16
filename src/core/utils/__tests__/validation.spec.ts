import {
  validateAuth0Options,
  validateActorTokenParameters,
} from '../validation';
import { AuthError } from '../../models';

describe('validateActorTokenParameters', () => {
  it('should not throw when neither parameter is provided', () => {
    expect(() => validateActorTokenParameters()).not.toThrow();
  });

  it('should not throw when both parameters are provided', () => {
    expect(() =>
      validateActorTokenParameters('actor-token', 'urn:token-type')
    ).not.toThrow();
  });

  it('should throw when only actorToken is provided', () => {
    expect(() => validateActorTokenParameters('actor-token')).toThrow(
      AuthError
    );
  });

  it('should throw with the invalid_actor_token_parameters code', () => {
    expect(() =>
      validateActorTokenParameters(undefined, 'urn:token-type')
    ).toThrow(
      expect.objectContaining({ code: 'invalid_actor_token_parameters' })
    );
  });
});

describe('validateAuth0Options', () => {
  const validOptions = {
    domain: 'my-tenant.auth0.com',
    clientId: 'MyClientId123',
  };

  it('should not throw an error for valid options', () => {
    // We expect this function call to complete without throwing any error.
    expect(() => validateAuth0Options(validOptions)).not.toThrow();
  });

  it('should throw an error if the options object is null or undefined', () => {
    // Test with undefined
    expect(() => validateAuth0Options(undefined as any)).toThrow(AuthError);
    expect(() => validateAuth0Options(undefined as any)).toThrow(
      'Auth0 options are required.'
    );

    // Test with null
    expect(() => validateAuth0Options(null as any)).toThrow(AuthError);
    expect(() => validateAuth0Options(null as any)).toThrow(
      'Auth0 options are required.'
    );
  });

  describe('domain validation', () => {
    it('should throw an error if domain is missing', () => {
      const options = { ...validOptions, domain: undefined as any };
      expect(() => validateAuth0Options(options)).toThrow(
        'A valid "domain" is required for the Auth0 client.'
      );
    });

    it('should throw an error if domain is not a string', () => {
      const options = { ...validOptions, domain: 12345 as any };
      expect(() => validateAuth0Options(options)).toThrow(
        'A valid "domain" is required for the Auth0 client.'
      );
    });

    it('should throw an error if domain is an empty string', () => {
      const options = { ...validOptions, domain: '' };
      expect(() => validateAuth0Options(options)).toThrow(
        'A valid "domain" is required for the Auth0 client.'
      );
    });

    it('should throw an error if domain is only whitespace', () => {
      const options = { ...validOptions, domain: '   ' };
      expect(() => validateAuth0Options(options)).toThrow(
        'A valid "domain" is required for the Auth0 client.'
      );
    });

    it('should throw an error if domain includes http:// protocol', () => {
      const options = { ...validOptions, domain: 'http://my-tenant.auth0.com' };
      expect(() => validateAuth0Options(options)).toThrow(
        'The "domain" should not include the protocol (e.g., "https://"). Provide the hostname only.'
      );
    });

    it('should throw an error if domain includes https:// protocol', () => {
      const options = {
        ...validOptions,
        domain: 'https://my-tenant.auth0.com',
      };
      expect(() => validateAuth0Options(options)).toThrow(
        'The "domain" should not include the protocol (e.g., "https://"). Provide the hostname only.'
      );
    });
  });

  describe('clientId validation', () => {
    it('should throw an error if clientId is missing', () => {
      const options = { ...validOptions, clientId: undefined as any };
      expect(() => validateAuth0Options(options)).toThrow(
        'A valid "clientId" is required for the Auth0 client.'
      );
    });

    it('should throw an error if clientId is not a string', () => {
      const options = { ...validOptions, clientId: 12345 as any };
      expect(() => validateAuth0Options(options)).toThrow(
        'A valid "clientId" is required for the Auth0 client.'
      );
    });

    it('should throw an error if clientId is an empty string', () => {
      const options = { ...validOptions, clientId: '' };
      expect(() => validateAuth0Options(options)).toThrow(
        'A valid "clientId" is required for the Auth0 client.'
      );
    });

    it('should throw an error if clientId is only whitespace', () => {
      const options = { ...validOptions, clientId: '   ' };
      expect(() => validateAuth0Options(options)).toThrow(
        'A valid "clientId" is required for the Auth0 client.'
      );
    });
  });
});
