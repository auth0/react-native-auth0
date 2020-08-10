import Auth from '../';
import fetchMock from 'fetch-mock';

describe('auth', () => {
  const baseUrl = 'samples.auth0.com';
  const clientId = 'A_CLIENT_ID_OF_YOUR_ACCOUNT';
  const telemetry = {name: 'react-native-auth0', version: '1.0.0'};
  const redirectUri = 'https://mysite.com/callback';
  const state = 'a random state for auth';
  const emptySuccess = {
    status: 200,
    body: {},
    headers: {'Content-Type': 'application/json'},
  };
  const tokens = {
    status: 200,
    body: {
      access_token: 'an access token',
      id_token: 'an id token',
      expires_in: 1234567890,
      state,
      scope: 'openid',
    },
    headers: {'Content-Type': 'application/json'},
  };
  const oauthError = {
    status: 400,
    body: {
      error: 'invalid_request',
      error_description: 'Invalid grant',
    },
    headers: {'Content-Type': 'application/json'},
  };
  const unexpectedError = {
    status: 500,
    body: 'Internal Server Error....',
    headers: {'Content-Type': 'text/plain'},
  };
  const auth = new Auth({baseUrl, clientId, telemetry});

  beforeEach(fetchMock.restore);

  describe('constructor', () => {
    it('should build with domain', () => {
      const auth = new Auth({baseUrl, clientId});
      expect(auth.clientId).toEqual(clientId);
    });

    it('should fail without clientId', () => {
      expect(() => new Auth({baseUrl})).toThrowErrorMatchingSnapshot();
    });

    it('should fail without domain', () => {
      expect(() => new Auth({clientId})).toThrowErrorMatchingSnapshot();
    });
  });

  describe('authorizeUrl', () => {
    it('should return default authorize url', () => {
      expect(
        auth.authorizeUrl({
          responseType: 'code',
          redirectUri,
          state: 'a_random_state',
        }),
      ).toMatchSnapshot();
    });

    it('should return default authorize url with extra parameters', () => {
      expect(
        auth.authorizeUrl({
          responseType: 'code',
          redirectUri,
          state: 'a_random_state',
          connection: 'facebook',
        }),
      ).toMatchSnapshot();
    });
  });

  describe('logoutUrl', () => {
    it('should return default logout url', () => {
      expect(auth.logoutUrl({})).toMatchSnapshot();
    });

    it('should return logout url with extra parameters', () => {
      expect(
        auth.logoutUrl({
          federated: true,
          clientId: 'CLIENT_ID',
          redirectTo: 'https://auth0.com',
        }),
      ).toMatchSnapshot();
    });

    it('should return logout url with skipping unknown parameters', () => {
      expect(
        auth.logoutUrl({
          federated: true,
          shouldNotBeThere: 'really',
        }),
      ).toMatchSnapshot();
    });
  });

  describe('code exchange', () => {
    it('should send correct payload', async () => {
      fetchMock.postOnce('https://samples.auth0.com/oauth/token', tokens);
      expect.assertions(1);
      await auth.exchange({
        code: 'a code',
        verifier: 'a verifier',
        redirectUri,
        state,
        scope: 'openid',
      });
      expect(fetchMock.lastCall()).toMatchSnapshot();
    });

    it('should return successful response', async () => {
      fetchMock.postOnce('https://samples.auth0.com/oauth/token', tokens);
      expect.assertions(1);
      const parameters = {
        code: 'a code',
        verifier: 'a verifier',
        redirectUri,
        state,
        scope: 'openid',
      };
      await expect(auth.exchange(parameters)).resolves.toMatchSnapshot();
    });

    it('should handle oauth error', async () => {
      fetchMock.postOnce('https://samples.auth0.com/oauth/token', oauthError);
      expect.assertions(1);
      const parameters = {
        code: 'a code',
        verifier: 'a verifier',
        redirectUri,
        state,
        scope: 'openid',
      };
      await expect(auth.exchange(parameters)).rejects.toMatchSnapshot();
    });

    it('should handle unexpected error', async () => {
      fetchMock.postOnce(
        'https://samples.auth0.com/oauth/token',
        unexpectedError,
      );
      expect.assertions(1);
      const parameters = {
        code: 'a code',
        verifier: 'a verifier',
        redirectUri,
        state,
        scope: 'openid',
      };
      await expect(auth.exchange(parameters)).rejects.toMatchSnapshot();
    });
  });

  describe('code exchange for native social', () => {
    it('should send correct payload', async () => {
      fetchMock.postOnce('https://samples.auth0.com/oauth/token', tokens);
      expect.assertions(1);
      await auth.exchangeNativeSocial({
        subjectToken: 'a subject token',
        subjectTokenType: 'a subject token type',
      });
      expect(fetchMock.lastCall()).toMatchSnapshot();
    });

    it('should send correct payload with optional parameters', async () => {
      fetchMock.postOnce('https://samples.auth0.com/oauth/token', tokens);
      expect.assertions(1);
      await auth.exchangeNativeSocial({
        subjectToken: 'a subject token',
        subjectTokenType: 'a subject token type',
        userProfile: {
          name: {
            firstName: 'John',
            lastName: 'Smith',
          },
        },
        audience: 'http://myapi.com',
        scope: 'openid',
      });
      expect(fetchMock.lastCall()).toMatchSnapshot();
    });

    it('should return successful response', async () => {
      fetchMock.postOnce('https://samples.auth0.com/oauth/token', tokens);
      expect.assertions(1);
      const parameters = {
        subjectToken: 'a subject token',
        subjectTokenType: 'a subject token type',
      };
      await expect(
        auth.exchangeNativeSocial(parameters),
      ).resolves.toMatchSnapshot();
    });

    it('should return successful response with optional parameters', async () => {
      fetchMock.postOnce('https://samples.auth0.com/oauth/token', tokens);
      expect.assertions(1);
      const parameters = {
        subjectToken: 'a subject token',
        subjectTokenType: 'a subject token type',
        userProfile: {
          name: {
            firstName: 'John',
            lastName: 'Smith',
          },
        },
        audience: 'http://myapi.com',
        scope: 'openid',
      };
      await expect(
        auth.exchangeNativeSocial(parameters),
      ).resolves.toMatchSnapshot();
    });

    it('should handle oauth error', async () => {
      fetchMock.postOnce('https://samples.auth0.com/oauth/token', oauthError);
      expect.assertions(1);
      const parameters = {
        subjectToken: 'a subject token',
        subjectTokenType: 'a subject token type',
      };
      await expect(
        auth.exchangeNativeSocial(parameters),
      ).rejects.toMatchSnapshot();
    });

    it('should handle unexpected error', async () => {
      fetchMock.postOnce(
        'https://samples.auth0.com/oauth/token',
        unexpectedError,
      );
      expect.assertions(1);
      const parameters = {
        subjectToken: 'a subject token',
        subjectTokenType: 'a subject token type',
      };
      await expect(
        auth.exchangeNativeSocial(parameters),
      ).rejects.toMatchSnapshot();
    });
  });

  describe('passwordless flow', () => {
    describe('with email connection', () => {
      it('should begin with code', async () => {
        fetchMock.postOnce(
          'https://samples.auth0.com/passwordless/start',
          emptySuccess,
        );
        expect.assertions(1);
        await auth.passwordlessWithEmail({
          email: 'info@auth0.com',
          send: 'link',
        });
        expect(fetchMock.lastCall()).toMatchSnapshot();
      });

      it('should begin with link', async () => {
        fetchMock.postOnce(
          'https://samples.auth0.com/passwordless/start',
          emptySuccess,
        );
        expect.assertions(1);
        await auth.passwordlessWithEmail({
          email: 'info@auth0.com',
          send: 'link',
        });
        expect(fetchMock.lastCall()).toMatchSnapshot();
      });

      it('should begin with optional parameters', async () => {
        fetchMock.postOnce(
          'https://samples.auth0.com/passwordless/start',
          emptySuccess,
        );
        expect.assertions(1);
        await auth.passwordlessWithEmail({
          email: 'info@auth0.com',
          send: 'code',
          authParams: {
            scope: 'openid profile',
          },
        });
        expect(fetchMock.lastCall()).toMatchSnapshot();
      });

      it('should continue', async () => {
        fetchMock.postOnce('https://samples.auth0.com/oauth/token', tokens);
        expect.assertions(1);
        await auth.loginWithEmail({
          email: 'info@auth0.com',
          code: '123456',
        });
        expect(fetchMock.lastCall()).toMatchSnapshot();
      });

      it('should continue with optional parameters', async () => {
        fetchMock.postOnce('https://samples.auth0.com/oauth/token', tokens);
        expect.assertions(1);
        await auth.loginWithEmail({
          email: 'info@auth0.com',
          code: '123456',
          audience: 'http://myapi.com',
          scope: 'openid',
        });
        expect(fetchMock.lastCall()).toMatchSnapshot();
      });
    });

    describe('with SMS connection', () => {
      it('should begin with code', async () => {
        fetchMock.postOnce(
          'https://samples.auth0.com/passwordless/start',
          emptySuccess,
        );
        expect.assertions(1);
        await auth.passwordlessWithSMS({
          phoneNumber: '+5491159991000',
          send: 'code',
        });
        expect(fetchMock.lastCall()).toMatchSnapshot();
      });

      it('should begin with link', async () => {
        fetchMock.postOnce(
          'https://samples.auth0.com/passwordless/start',
          emptySuccess,
        );
        expect.assertions(1);
        await auth.passwordlessWithSMS({
          phoneNumber: '+5491159991000',
          send: 'link',
        });
        expect(fetchMock.lastCall()).toMatchSnapshot();
      });

      it('should begin with optional parameters', async () => {
        fetchMock.postOnce(
          'https://samples.auth0.com/passwordless/start',
          emptySuccess,
        );
        expect.assertions(1);
        await auth.passwordlessWithSMS({
          phoneNumber: '+5491159991000',
          send: 'code',
          authParams: {
            scope: 'openid profile',
          },
        });
        expect(fetchMock.lastCall()).toMatchSnapshot();
      });

      it('should continue', async () => {
        fetchMock.postOnce('https://samples.auth0.com/oauth/token', tokens);
        expect.assertions(1);
        await auth.loginWithSMS({
          phoneNumber: '+5491159991000',
          code: '123456',
        });
        expect(fetchMock.lastCall()).toMatchSnapshot();
      });

      it('should continue with optional parameters', async () => {
        fetchMock.postOnce('https://samples.auth0.com/oauth/token', tokens);
        expect.assertions(1);
        await auth.loginWithSMS({
          phoneNumber: '+5491159991000',
          code: '123456',
          audience: 'http://myapi.com',
          scope: 'openid',
        });
        expect(fetchMock.lastCall()).toMatchSnapshot();
      });
    });
  });

  describe('password realm', () => {
    const parameters = {
      username: 'info@auth0.com',
      password: 'secret pass',
      realm: 'Username-Password-Authentication',
      audience: 'http://myapi.com',
      scope: 'openid',
    };
    it('should send correct payload', async () => {
      fetchMock.postOnce('https://samples.auth0.com/oauth/token', tokens);
      expect.assertions(1);
      await auth.passwordRealm(parameters);
      expect(fetchMock.lastCall()).toMatchSnapshot();
    });

    it('should return successful response', async () => {
      fetchMock.postOnce('https://samples.auth0.com/oauth/token', tokens);
      expect.assertions(1);
      await expect(auth.passwordRealm(parameters)).resolves.toMatchSnapshot();
    });

    it('should handle oauth error', async () => {
      fetchMock.postOnce('https://samples.auth0.com/oauth/token', oauthError);
      expect.assertions(1);
      await expect(auth.passwordRealm(parameters)).rejects.toMatchSnapshot();
    });

    it('should handle unexpected error', async () => {
      fetchMock.postOnce(
        'https://samples.auth0.com/oauth/token',
        unexpectedError,
      );
      expect.assertions(1);
      await expect(auth.passwordRealm(parameters)).rejects.toMatchSnapshot();
    });
  });

  describe('refresh token', () => {
    const parameters = {
      refreshToken: 'a refresh token of a user',
      scope: 'openid',
    };
    it('should send correct payload', async () => {
      fetchMock.postOnce('https://samples.auth0.com/oauth/token', tokens);
      expect.assertions(1);
      await auth.refreshToken(parameters);
      expect(fetchMock.lastCall()).toMatchSnapshot();
    });

    it('should return successful response', async () => {
      fetchMock.postOnce('https://samples.auth0.com/oauth/token', tokens);
      expect.assertions(1);
      await expect(auth.refreshToken(parameters)).resolves.toMatchSnapshot();
    });

    it('should handle oauth error', async () => {
      fetchMock.postOnce('https://samples.auth0.com/oauth/token', oauthError);
      expect.assertions(1);
      await expect(auth.refreshToken(parameters)).rejects.toMatchSnapshot();
    });

    it('should handle unexpected error', async () => {
      fetchMock.postOnce(
        'https://samples.auth0.com/oauth/token',
        unexpectedError,
      );
      expect.assertions(1);
      await expect(auth.refreshToken(parameters)).rejects.toMatchSnapshot();
    });

    it('should handle invalid token error', async () => {
      fetchMock.postOnce('https://samples.auth0.com/oauth/token', {
        status: 401,
        body: {},
        headers: {'www-authenticate': 'Bearer error="invalid_token"'},
      });
      expect.assertions(1);
      await expect(auth.refreshToken(parameters)).rejects.toMatchSnapshot();
    });

    it('should handle unknown error', async () => {
      fetchMock.postOnce('https://samples.auth0.com/oauth/token', {
        status: 401,
        body: {},
        headers: {},
      });
      expect.assertions(1);
      await expect(auth.refreshToken(parameters)).rejects.toMatchSnapshot();
    });
  });

  describe('revoke token', () => {
    const parameters = {refreshToken: 'a refresh token of a user'};
    const success = {
      status: 200,
      body: null,
      headers: {'Content-Type': 'application/json'},
    };
    it('should send correct payload', async () => {
      fetchMock.postOnce('https://samples.auth0.com/oauth/revoke', success);
      expect.assertions(1);
      await auth.revoke(parameters);
      expect(fetchMock.lastCall()).toMatchSnapshot();
    });

    it('should return successful response', async () => {
      fetchMock.postOnce('https://samples.auth0.com/oauth/revoke', success);
      expect.assertions(1);
      await expect(auth.revoke(parameters)).resolves.toMatchSnapshot();
    });

    it('should handle oauth error', async () => {
      fetchMock.postOnce('https://samples.auth0.com/oauth/revoke', oauthError);
      expect.assertions(1);
      await expect(auth.revoke(parameters)).rejects.toMatchSnapshot();
    });

    it('should handle unexpected error', async () => {
      fetchMock.postOnce(
        'https://samples.auth0.com/oauth/revoke',
        unexpectedError,
      );
      expect.assertions(1);
      await expect(auth.revoke(parameters)).rejects.toMatchSnapshot();
    });
  });

  describe('user info', () => {
    const parameters = {token: 'an access token of a user'};
    const success = {
      status: 200,
      body: {
        sub: '248289761001',
        name: 'Jane Doe',
        given_name: 'Jane',
        family_name: 'Doe',
        preferred_username: 'j.doe',
        email: 'janedoe@example.com',
        updated_at: 1497317424,
        picture: 'http://example.com/janedoe/me.jpg',
        'http://mysite.com/claims/customer': 192837465,
        'http://mysite.com/claims/status': 'closed',
      },
      headers: {'Content-Type': 'application/json'},
    };
    it('should send correct payload', async () => {
      fetchMock.getOnce('https://samples.auth0.com/userinfo', success);
      expect.assertions(1);
      await auth.userInfo(parameters);
      expect(fetchMock.lastCall()).toMatchSnapshot();
    });

    it('should return successful oidc response', async () => {
      fetchMock.getOnce('https://samples.auth0.com/userinfo', success);
      expect.assertions(1);
      await expect(auth.userInfo(parameters)).resolves.toMatchSnapshot();
    });

    it('should return successful non-oidc response', async () => {
      fetchMock.getOnce('https://samples.auth0.com/userinfo', {
        sub: 'auth0|1029837475',
      });
      expect.assertions(1);
      await expect(auth.userInfo(parameters)).resolves.toMatchSnapshot();
    });

    it('should handle oauth error', async () => {
      fetchMock.getOnce('https://samples.auth0.com/userinfo', oauthError);
      expect.assertions(1);
      await expect(auth.userInfo(parameters)).rejects.toMatchSnapshot();
    });

    it('should handle unexpected error', async () => {
      fetchMock.getOnce('https://samples.auth0.com/userinfo', unexpectedError);
      expect.assertions(1);
      await expect(auth.userInfo(parameters)).rejects.toMatchSnapshot();
    });
  });

  describe('change password', () => {
    const parameters = {
      email: 'info@auth0.com',
      connection: 'Username-Password-Authentication',
    };
    const success = {
      status: 200,
      body: "We've just sent you an email to reset your password.",
      headers: {'Content-Type': 'text/html'},
    };
    it('should send correct payload', async () => {
      fetchMock.postOnce(
        'https://samples.auth0.com/dbconnections/change_password',
        success,
      );
      expect.assertions(1);
      await auth.resetPassword(parameters);
      expect(fetchMock.lastCall()).toMatchSnapshot();
    });

    it('should return successful response', async () => {
      fetchMock.postOnce(
        'https://samples.auth0.com/dbconnections/change_password',
        success,
      );
      expect.assertions(1);
      await expect(auth.resetPassword(parameters)).resolves.toMatchSnapshot();
    });

    it('should handle oauth error', async () => {
      fetchMock.postOnce(
        'https://samples.auth0.com/dbconnections/change_password',
        oauthError,
      );
      expect.assertions(1);
      await expect(auth.resetPassword(parameters)).rejects.toMatchSnapshot();
    });

    it('should handle unexpected error', async () => {
      fetchMock.postOnce(
        'https://samples.auth0.com/dbconnections/change_password',
        unexpectedError,
      );
      expect.assertions(1);
      await expect(auth.resetPassword(parameters)).rejects.toMatchSnapshot();
    });
  });

  describe('create user', () => {
    const parameters = {
      email: 'info@auth0.com',
      password: 'secret',
      connection: 'aconnection',
    };
    const success = {
      status: 200,
      body: {
        email: 'info@auth0.com',
        email_verified: false,
      },
      headers: {'Content-Type': 'application/json'},
    };
    const auth0Error = {
      status: 400,
      body: {
        code: 'user_exists',
        description: 'The user already exists.',
        name: 'BadRequestError',
        statusCode: 400,
      },
      headers: {'Content-Type': 'application/json'},
    };

    it('should send correct payload', async () => {
      fetchMock.postOnce(
        'https://samples.auth0.com/dbconnections/signup',
        success,
      );
      expect.assertions(1);
      await auth.createUser(parameters);
      expect(fetchMock.lastCall()).toMatchSnapshot();
    });

    it('should send correct payload with username', async () => {
      fetchMock.postOnce(
        'https://samples.auth0.com/dbconnections/signup',
        success,
      );
      expect.assertions(1);
      await auth.createUser({...parameters, usename: 'info'});
      expect(fetchMock.lastCall()).toMatchSnapshot();
    });

    it('should send correct payload with metadata', async () => {
      fetchMock.postOnce(
        'https://samples.auth0.com/dbconnections/signup',
        success,
      );
      expect.assertions(1);
      await auth.createUser({...parameters, metadata: {customerId: 12345}});
      expect(fetchMock.lastCall()).toMatchSnapshot();
    });

    it('should return successful response', async () => {
      fetchMock.postOnce(
        'https://samples.auth0.com/dbconnections/signup',
        success,
      );
      expect.assertions(1);
      await expect(auth.createUser(parameters)).resolves.toMatchSnapshot();
    });

    it('should handle auth0 error', async () => {
      fetchMock.postOnce(
        'https://samples.auth0.com/dbconnections/signup',
        auth0Error,
      );
      expect.assertions(1);
      await expect(auth.createUser(parameters)).rejects.toMatchSnapshot();
    });

    it('should handle unexpected error', async () => {
      fetchMock.postOnce(
        'https://samples.auth0.com/dbconnections/signup',
        unexpectedError,
      );
      expect.assertions(1);
      await expect(auth.createUser(parameters)).rejects.toMatchSnapshot();
    });
  });
});
