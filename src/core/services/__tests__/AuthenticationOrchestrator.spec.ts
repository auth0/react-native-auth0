import { AuthenticationOrchestrator } from '../AuthenticationOrchestrator';
import { HttpClient } from '../HttpClient';
import {
  AuthError,
  Auth0User,
  Credentials as CredentialsModel,
} from '../../models';

// 1. Mock the HttpClient. We only need to mock the methods we use.
jest.mock('../HttpClient');
const MockHttpClient = HttpClient as jest.MockedClass<typeof HttpClient>;

// 2. Define test data, mirroring the old auth.spec.js file.
const baseUrl = 'https://samples.auth0.com';
const clientId = 'A_CLIENT_ID_OF_YOUR_ACCOUNT';
const state = 'a random state for auth';
const validIdToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhdXRoMHwxMjM0NSJ9.s-V2h_Yfxb19i5d6sB7B5p9a8j_hS_p-A-gNq8lT9iY';

const tokensResponse = {
  access_token: 'an access token',
  id_token: validIdToken,
  expires_in: 86400,
  token_type: 'Bearer',
  state,
  scope: 'openid',
};

const oauthErrorResponse = {
  error: 'invalid_request',
  error_description: 'Invalid grant',
};

const emptySuccessResponse = {};

const userProfileResponse = {
  sub: 'auth0|248289761001',
  name: 'Jane Doe',
  given_name: 'Jane',
  family_name: 'Doe',
  preferred_username: 'j.doe',
  email: 'janedoe@example.com',
};

describe('AuthenticationOrchestrator', () => {
  let orchestrator: AuthenticationOrchestrator;
  let mockHttpClientInstance: jest.Mocked<HttpClient>;

  beforeAll(() => {
    // Set a fixed date for consistent `expiresAt` calculations
    jest.useFakeTimers().setSystemTime(new Date('2023-01-01T00:00:00Z'));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    // Reset mocks and create new instances for each test
    MockHttpClient.mockClear();
    orchestrator = new AuthenticationOrchestrator({
      clientId,
      httpClient: new MockHttpClient({ baseUrl }),
    });
    mockHttpClientInstance = MockHttpClient.mock.instances[0];
  });

  // Note: Constructor and URL builder tests are not applicable here.

  describe('password realm', () => {
    const parameters = {
      username: 'info@auth0.com',
      password: 'secret pass',
      realm: 'Username-Password-Authentication',
      audience: 'http://myapi.com',
      scope: 'openid',
    };

    it('should send correct payload', async () => {
      mockHttpClientInstance.post.mockResolvedValueOnce({
        json: tokensResponse,
        response: new Response(null, { status: 200 }),
      });
      await orchestrator.passwordRealm(parameters);

      expect(mockHttpClientInstance.post).toHaveBeenCalledWith(
        '/oauth/token',
        expect.objectContaining({
          grant_type: 'http://auth0.com/oauth/grant-type/password-realm',
          client_id: clientId,
          username: parameters.username,
          password: parameters.password,
          realm: parameters.realm,
          audience: parameters.audience,
          scope: parameters.scope,
        }),
        undefined // headers
      );
    });

    it('should return successful response', async () => {
      mockHttpClientInstance.post.mockResolvedValueOnce({
        json: tokensResponse,
        response: new Response(null, { status: 200 }),
      });

      await expect(
        orchestrator.passwordRealm(parameters)
      ).resolves.toBeInstanceOf(CredentialsModel);
    });

    it('should handle oauth error', async () => {
      mockHttpClientInstance.post.mockResolvedValueOnce({
        json: oauthErrorResponse,
        response: new Response(null, { status: 400 }),
      });

      await expect(orchestrator.passwordRealm(parameters)).rejects.toThrow(
        AuthError
      );
    });

    it('should auto-include openid scope when scope is undefined', async () => {
      mockHttpClientInstance.post.mockResolvedValueOnce({
        json: tokensResponse,
        response: new Response(null, { status: 200 }),
      });
      await orchestrator.passwordRealm({
        username: 'info@auth0.com',
        password: 'secret pass',
        realm: 'Username-Password-Authentication',
      });

      expect(mockHttpClientInstance.post).toHaveBeenCalledWith(
        '/oauth/token',
        expect.objectContaining({
          scope: 'openid profile email',
        }),
        undefined
      );
    });

    it('should auto-include openid scope when not present in custom scope', async () => {
      mockHttpClientInstance.post.mockResolvedValueOnce({
        json: tokensResponse,
        response: new Response(null, { status: 200 }),
      });
      await orchestrator.passwordRealm({
        username: 'info@auth0.com',
        password: 'secret pass',
        realm: 'Username-Password-Authentication',
        scope: 'offline_access',
      });

      expect(mockHttpClientInstance.post).toHaveBeenCalledWith(
        '/oauth/token',
        expect.objectContaining({
          scope: 'openid offline_access',
        }),
        undefined
      );
    });
  });

  describe('refresh token', () => {
    const parameters = {
      refreshToken: 'a refresh token of a user',
      scope: 'openid',
    };

    it('should send correct payload', async () => {
      mockHttpClientInstance.post.mockResolvedValueOnce({
        json: tokensResponse,
        response: new Response(null, { status: 200 }),
      });
      await orchestrator.refreshToken(parameters);

      expect(mockHttpClientInstance.post).toHaveBeenCalledWith(
        '/oauth/token',
        expect.objectContaining({
          grant_type: 'refresh_token',
          client_id: clientId,
          refresh_token: parameters.refreshToken,
          scope: 'openid',
        }),
        undefined
      );
    });

    it('should return successful response', async () => {
      mockHttpClientInstance.post.mockResolvedValueOnce({
        json: tokensResponse,
        response: new Response(null, { status: 200 }),
      });
      await expect(
        orchestrator.refreshToken(parameters)
      ).resolves.toBeInstanceOf(CredentialsModel);
    });

    it('should handle oauth error', async () => {
      mockHttpClientInstance.post.mockResolvedValueOnce({
        json: oauthErrorResponse,
        response: new Response(null, { status: 400 }),
      });
      await expect(orchestrator.refreshToken(parameters)).rejects.toThrow(
        AuthError
      );
    });

    it('should auto-include openid scope when scope is undefined', async () => {
      mockHttpClientInstance.post.mockResolvedValueOnce({
        json: tokensResponse,
        response: new Response(null, { status: 200 }),
      });
      await orchestrator.refreshToken({
        refreshToken: 'a refresh token of a user',
      });

      expect(mockHttpClientInstance.post).toHaveBeenCalledWith(
        '/oauth/token',
        expect.objectContaining({
          scope: 'openid profile email',
        }),
        undefined
      );
    });

    it('should auto-include openid scope when not present in custom scope', async () => {
      mockHttpClientInstance.post.mockResolvedValueOnce({
        json: tokensResponse,
        response: new Response(null, { status: 200 }),
      });
      await orchestrator.refreshToken({
        refreshToken: 'a refresh token of a user',
        scope: 'offline_access',
      });

      expect(mockHttpClientInstance.post).toHaveBeenCalledWith(
        '/oauth/token',
        expect.objectContaining({
          scope: 'openid offline_access',
        }),
        undefined
      );
    });
  });

  describe('revoke token', () => {
    const parameters = { refreshToken: 'a refresh token of a user' };

    it('should send correct payload', async () => {
      mockHttpClientInstance.post.mockResolvedValueOnce({
        json: {},
        response: new Response(null, { status: 200 }),
      });
      await orchestrator.revoke(parameters);

      expect(mockHttpClientInstance.post).toHaveBeenCalledWith(
        '/oauth/revoke',
        expect.objectContaining({
          token: parameters.refreshToken,
          client_id: clientId,
        }),
        undefined
      );
    });

    it('should return successful response', async () => {
      mockHttpClientInstance.post.mockResolvedValueOnce({
        json: {},
        response: new Response(null, { status: 200 }),
      });
      await expect(orchestrator.revoke(parameters)).resolves.toBeUndefined();
    });

    it('should handle oauth error', async () => {
      mockHttpClientInstance.post.mockResolvedValueOnce({
        json: oauthErrorResponse,
        response: new Response(null, { status: 400 }),
      });
      await expect(orchestrator.revoke(parameters)).rejects.toThrow(AuthError);
    });
  });

  describe('user info', () => {
    const parameters = { token: 'an access token of a user' };

    it('should send correct payload', async () => {
      mockHttpClientInstance.get.mockResolvedValueOnce({
        json: userProfileResponse,
        response: new Response(null, { status: 200 }),
      });
      await orchestrator.userInfo(parameters);

      expect(mockHttpClientInstance.get).toHaveBeenCalledWith(
        '/userinfo',
        undefined,
        {
          Authorization: `Bearer ${parameters.token}`,
        }
      );
    });

    it('should return successful oidc response', async () => {
      mockHttpClientInstance.get.mockResolvedValueOnce({
        json: userProfileResponse,
        response: new Response(null, { status: 200 }),
      });

      const user = await orchestrator.userInfo(parameters);
      expect(user).toBeInstanceOf(Auth0User);
      expect(user.sub).toBe(userProfileResponse.sub);
      expect(user.givenName).toBe(userProfileResponse.given_name);
    });

    it('should handle oauth error', async () => {
      mockHttpClientInstance.get.mockResolvedValueOnce({
        json: oauthErrorResponse,
        response: new Response(null, { status: 400 }),
      });
      await expect(orchestrator.userInfo(parameters)).rejects.toThrow(
        AuthError
      );
    });
  });

  describe('passwordless flow', () => {
    describe('with email connection', () => {
      it('should begin with code', async () => {
        mockHttpClientInstance.post.mockResolvedValueOnce({
          json: emptySuccessResponse,
          response: new Response(null, { status: 200 }),
        });
        await orchestrator.passwordlessWithEmail({
          email: 'info@auth0.com',
          send: 'code',
        });
        expect(mockHttpClientInstance.post).toHaveBeenCalledWith(
          '/passwordless/start',
          {
            client_id: clientId,
            connection: 'email',
            email: 'info@auth0.com',
            send: 'code',
            authParams: undefined,
          },
          undefined
        );
      });

      it('should continue with code', async () => {
        mockHttpClientInstance.post.mockResolvedValueOnce({
          json: tokensResponse,
          response: new Response(null, { status: 200 }),
        });
        await orchestrator.loginWithEmail({
          email: 'info@auth0.com',
          code: '123456',
        });
        expect(mockHttpClientInstance.post).toHaveBeenCalledWith(
          '/oauth/token',
          expect.objectContaining({
            grant_type: 'http://auth0.com/oauth/grant-type/passwordless/otp',
            username: 'info@auth0.com',
            otp: '123456',
            realm: 'email',
          }),
          undefined
        );
      });

      it('should auto-include openid scope when scope is undefined', async () => {
        mockHttpClientInstance.post.mockResolvedValueOnce({
          json: tokensResponse,
          response: new Response(null, { status: 200 }),
        });
        await orchestrator.loginWithEmail({
          email: 'info@auth0.com',
          code: '123456',
        });
        expect(mockHttpClientInstance.post).toHaveBeenCalledWith(
          '/oauth/token',
          expect.objectContaining({
            scope: 'openid profile email',
          }),
          undefined
        );
      });

      it('should auto-include openid scope when not present in custom scope', async () => {
        mockHttpClientInstance.post.mockResolvedValueOnce({
          json: tokensResponse,
          response: new Response(null, { status: 200 }),
        });
        await orchestrator.loginWithEmail({
          email: 'info@auth0.com',
          code: '123456',
          scope: 'profile email',
        });
        expect(mockHttpClientInstance.post).toHaveBeenCalledWith(
          '/oauth/token',
          expect.objectContaining({
            scope: 'openid profile email',
          }),
          undefined
        );
      });
    });

    describe('with SMS connection', () => {
      it('should begin with code', async () => {
        mockHttpClientInstance.post.mockResolvedValueOnce({
          json: emptySuccessResponse,
          response: new Response(null, { status: 200 }),
        });
        await orchestrator.passwordlessWithSMS({ phoneNumber: '+15555555555' });
        expect(mockHttpClientInstance.post).toHaveBeenCalledWith(
          '/passwordless/start',
          {
            client_id: clientId,
            connection: 'sms',
            phone_number: '+15555555555',
            send: undefined,
            authParams: undefined,
          },
          undefined
        );
      });

      it('should continue with code', async () => {
        mockHttpClientInstance.post.mockResolvedValueOnce({
          json: tokensResponse,
          response: new Response(null, { status: 200 }),
        });
        await orchestrator.loginWithSMS({
          phoneNumber: '+15555555555',
          code: '123456',
        });
        expect(mockHttpClientInstance.post).toHaveBeenCalledWith(
          '/oauth/token',
          expect.objectContaining({
            grant_type: 'http://auth0.com/oauth/grant-type/passwordless/otp',
            username: '+15555555555',
            otp: '123456',
            realm: 'sms',
          }),
          undefined
        );
      });

      it('should auto-include openid scope when scope is undefined', async () => {
        mockHttpClientInstance.post.mockResolvedValueOnce({
          json: tokensResponse,
          response: new Response(null, { status: 200 }),
        });
        await orchestrator.loginWithSMS({
          phoneNumber: '+15555555555',
          code: '123456',
        });
        expect(mockHttpClientInstance.post).toHaveBeenCalledWith(
          '/oauth/token',
          expect.objectContaining({
            scope: 'openid profile email',
          }),
          undefined
        );
      });

      it('should auto-include openid scope when not present in custom scope', async () => {
        mockHttpClientInstance.post.mockResolvedValueOnce({
          json: tokensResponse,
          response: new Response(null, { status: 200 }),
        });
        await orchestrator.loginWithSMS({
          phoneNumber: '+15555555555',
          code: '123456',
          scope: 'offline_access',
        });
        expect(mockHttpClientInstance.post).toHaveBeenCalledWith(
          '/oauth/token',
          expect.objectContaining({
            scope: 'openid offline_access',
          }),
          undefined
        );
      });

      it('should not duplicate openid scope when already present', async () => {
        mockHttpClientInstance.post.mockResolvedValueOnce({
          json: tokensResponse,
          response: new Response(null, { status: 200 }),
        });
        await orchestrator.loginWithSMS({
          phoneNumber: '+15555555555',
          code: '123456',
          scope: 'openid profile email',
        });
        expect(mockHttpClientInstance.post).toHaveBeenCalledWith(
          '/oauth/token',
          expect.objectContaining({
            scope: 'openid profile email',
          }),
          undefined
        );
      });
    });
  });

  // New tests for MFA flows
  describe('MFA flows', () => {
    it('loginWithOTP should send correct payload', async () => {
      mockHttpClientInstance.post.mockResolvedValueOnce({
        json: tokensResponse,
        response: new Response(null, { status: 200 }),
      });
      await orchestrator.loginWithOTP({
        mfaToken: 'mfa_token_123',
        otp: '123456',
      });
      expect(mockHttpClientInstance.post).toHaveBeenCalledWith(
        '/oauth/token',
        expect.objectContaining({
          grant_type: 'http://auth0.com/oauth/grant-type/mfa-otp',
          mfa_token: 'mfa_token_123',
          otp: '123456',
        }),
        undefined
      );
    });

    it('loginWithOOB should send correct payload', async () => {
      mockHttpClientInstance.post.mockResolvedValueOnce({
        json: tokensResponse,
        response: new Response(null, { status: 200 }),
      });
      await orchestrator.loginWithOOB({
        mfaToken: 'mfa_token_123',
        oobCode: 'oob_code_abc',
        bindingCode: '123',
      });
      expect(mockHttpClientInstance.post).toHaveBeenCalledWith(
        '/oauth/token',
        expect.objectContaining({
          grant_type: 'http://auth0.com/oauth/grant-type/mfa-oob',
          mfa_token: 'mfa_token_123',
          oob_code: 'oob_code_abc',
          binding_code: '123',
        }),
        undefined
      );
    });

    it('loginWithRecoveryCode should send correct payload', async () => {
      mockHttpClientInstance.post.mockResolvedValueOnce({
        json: tokensResponse,
        response: new Response(null, { status: 200 }),
      });
      await orchestrator.loginWithRecoveryCode({
        mfaToken: 'mfa_token_123',
        recoveryCode: 'recovery123',
      });
      expect(mockHttpClientInstance.post).toHaveBeenCalledWith(
        '/oauth/token',
        expect.objectContaining({
          grant_type: 'http://auth0.com/oauth/grant-type/mfa-recovery-code',
          mfa_token: 'mfa_token_123',
          recovery_code: 'recovery123',
        }),
        undefined
      );
    });

    it('multifactorChallenge should send correct payload and return response', async () => {
      const challengeResponse = { challengeType: 'oob', oobCode: 'abc' };
      mockHttpClientInstance.post.mockResolvedValueOnce({
        json: challengeResponse,
        response: new Response(null, { status: 200 }),
      });
      const result = await orchestrator.multifactorChallenge({
        mfaToken: 'mfa_token_123',
        challengeType: 'oob',
        authenticatorId: 'auth_id_1',
      });

      expect(mockHttpClientInstance.post).toHaveBeenCalledWith(
        '/mfa/challenge',
        {
          client_id: clientId,
          mfa_token: 'mfa_token_123',
          challenge_type: 'oob',
          authenticator_id: 'auth_id_1',
        },
        undefined
      );
      expect(result).toEqual(challengeResponse);
    });
  });

  describe('user management', () => {
    it('resetPassword should send correct payload', async () => {
      mockHttpClientInstance.post.mockResolvedValueOnce({
        json: {},
        response: new Response(null, { status: 200 }),
      });
      await orchestrator.resetPassword({
        email: 'info@auth0.com',
        connection: 'Username-Password-Authentication',
      });

      expect(mockHttpClientInstance.post).toHaveBeenCalledWith(
        '/dbconnections/change_password',
        {
          client_id: clientId,
          email: 'info@auth0.com',
          connection: 'Username-Password-Authentication',
        },
        undefined
      );
    });

    it('resetPassword should include organization when provided', async () => {
      mockHttpClientInstance.post.mockResolvedValueOnce({
        json: {},
        response: new Response(null, { status: 200 }),
      });
      await orchestrator.resetPassword({
        email: 'info@auth0.com',
        connection: 'Username-Password-Authentication',
        organization: 'org_123',
      });

      expect(mockHttpClientInstance.post).toHaveBeenCalledWith(
        '/dbconnections/change_password',
        {
          client_id: clientId,
          email: 'info@auth0.com',
          connection: 'Username-Password-Authentication',
          organization: 'org_123',
        },
        undefined
      );
    });

    it('resetPassword should handle custom headers', async () => {
      mockHttpClientInstance.post.mockResolvedValueOnce({
        json: {},
        response: new Response(null, { status: 200 }),
      });
      await orchestrator.resetPassword({
        email: 'info@auth0.com',
        connection: 'Username-Password-Authentication',
        organization: 'org_456',
        headers: { 'X-Custom-Header': 'custom-value' },
      });

      expect(mockHttpClientInstance.post).toHaveBeenCalledWith(
        '/dbconnections/change_password',
        {
          client_id: clientId,
          email: 'info@auth0.com',
          connection: 'Username-Password-Authentication',
          organization: 'org_456',
        },
        { 'X-Custom-Header': 'custom-value' }
      );
    });

    it('resetPassword should handle error response', async () => {
      const errorResponse = {
        error: 'invalid_request',
        error_description: 'Invalid connection',
      };
      mockHttpClientInstance.post.mockResolvedValueOnce({
        json: errorResponse,
        response: new Response(null, { status: 400 }),
      });

      await expect(
        orchestrator.resetPassword({
          email: 'info@auth0.com',
          connection: 'Invalid-Connection',
        })
      ).rejects.toThrow(AuthError);
    });

    it('createUser should send correct payload and return camelCased response', async () => {
      const userResponse = {
        id: 'user_id_123',
        email_verified: false,
        email: 'info@auth0.com',
      };
      mockHttpClientInstance.post.mockResolvedValueOnce({
        json: userResponse,
        response: new Response(null, { status: 200 }),
      });

      const result = await orchestrator.createUser({
        email: 'info@auth0.com',
        password: 'secret_password',
        connection: 'Username-Password-Authentication',
        metadata: { plan: 'premium' },
      });

      expect(mockHttpClientInstance.post).toHaveBeenCalledWith(
        '/dbconnections/signup',
        expect.objectContaining({
          client_id: clientId,
          email: 'info@auth0.com',
          connection: 'Username-Password-Authentication',
          user_metadata: { plan: 'premium' },
        }),
        undefined
      );

      expect(result).toEqual({
        id: 'user_id_123',
        emailVerified: false,
        email: 'info@auth0.com',
      });
    });
  });

  describe('token exchange', () => {
    it('code exchange should send correct payload', async () => {
      mockHttpClientInstance.post.mockResolvedValueOnce({
        json: tokensResponse,
        response: new Response(null, { status: 200 }),
      });
      await orchestrator.exchange({
        code: 'code123',
        verifier: 'verifier456',
        redirectUri: 'https://app/callback',
      });

      expect(mockHttpClientInstance.post).toHaveBeenCalledWith(
        '/oauth/token',
        expect.objectContaining({
          grant_type: 'authorization_code',
          client_id: clientId,
          code_verifier: 'verifier456',
          code: 'code123',
          redirect_uri: 'https://app/callback',
        }),
        undefined
      );
    });

    it('native social exchange should send correct payload', async () => {
      mockHttpClientInstance.post.mockResolvedValueOnce({
        json: tokensResponse,
        response: new Response(null, { status: 200 }),
      });
      await orchestrator.exchangeNativeSocial({
        subjectToken: 'native_token',
        subjectTokenType: 'facebook',
      });

      expect(mockHttpClientInstance.post).toHaveBeenCalledWith(
        '/oauth/token',
        expect.objectContaining({
          grant_type: 'urn:ietf:params:oauth:grant-type:token-exchange',
          client_id: clientId,
          subject_token: 'native_token',
          subject_token_type: 'facebook',
        }),
        undefined
      );
    });

    it('should auto-include openid scope when scope is undefined', async () => {
      mockHttpClientInstance.post.mockResolvedValueOnce({
        json: tokensResponse,
        response: new Response(null, { status: 200 }),
      });
      await orchestrator.exchangeNativeSocial({
        subjectToken: 'native_token',
        subjectTokenType: 'facebook',
      });

      expect(mockHttpClientInstance.post).toHaveBeenCalledWith(
        '/oauth/token',
        expect.objectContaining({
          scope: 'openid profile email',
        }),
        undefined
      );
    });

    it('should auto-include openid scope when not present in custom scope', async () => {
      mockHttpClientInstance.post.mockResolvedValueOnce({
        json: tokensResponse,
        response: new Response(null, { status: 200 }),
      });
      await orchestrator.exchangeNativeSocial({
        subjectToken: 'native_token',
        subjectTokenType: 'facebook',
        scope: 'profile email',
      });

      expect(mockHttpClientInstance.post).toHaveBeenCalledWith(
        '/oauth/token',
        expect.objectContaining({
          scope: 'openid profile email',
        }),
        undefined
      );
    });
  });
});

