/**
 * @jest-environment jsdom
 */
import React, { act } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import Auth0Provider from '../auth0-provider';
import useAuth0 from '../use-auth0';
import LocalAuthenticationStrategy from '../../credentials-manager/localAuthenticationStrategy';
import Auth0Error from '../../auth/auth0Error';

function makeJwt(claims) {
  const header = { alg: 'RS256', typ: 'JWT' };

  const payload = {
    sub: '1',
    iss: 'https://auth0.com',
    aud: 'client123',
    name: 'Test User',
    family_name: 'User',
    picture: 'https://images/pic.png',
    ...(claims !== undefined ? { ...claims } : null),
  };

  // prettier-ignore
  return `${Buffer.from(JSON.stringify(header)).toString('base64')}.${Buffer.from(JSON.stringify(payload)).toString('base64')}.${Buffer.from('signature').toString('base64')}`;
}

const mockIdToken = makeJwt();

const mockCredentials = {
  idToken: mockIdToken,
  accessToken: 'ACCESS TOKEN',
};

const mockAuthError = new Auth0Error({ json: { error: 'mock error' } });

const updatedMockCredentialsWithIdToken = {
  idToken: makeJwt({ name: 'Different User' }),
  accessToken: 'ACCESS TOKEN',
};

const updatedMockCredentialsWithoutIdToken = {
  accessToken: 'ACCESS TOKEN',
};

const wrapper = ({ children }) => (
  <Auth0Provider domain="DOMAIN" clientId="CLIENT ID">
    {children}
  </Auth0Provider>
);

const mockAuth0 = {
  webAuth: {
    authorize: jest.fn().mockResolvedValue(mockCredentials),
    clearSession: jest.fn().mockResolvedValue(),
  },
  auth: {
    passwordlessWithSMS: jest.fn().mockResolvedValue(),
    loginWithSMS: jest.fn().mockResolvedValue(mockCredentials),
    passwordlessWithEmail: jest.fn().mockResolvedValue(),
    loginWithEmail: jest.fn().mockResolvedValue(mockCredentials),
    multifactorChallenge: jest.fn().mockResolvedValue(),
    loginWithOOB: jest.fn().mockResolvedValue(mockCredentials),
    loginWithOTP: jest.fn().mockResolvedValue(mockCredentials),
    loginWithRecoveryCode: jest.fn().mockResolvedValue(mockCredentials),
    hasValidCredentials: jest.fn().mockResolvedValue(),
    passwordRealm: jest.fn().mockResolvedValue(mockCredentials),
    exchangeNativeSocial: jest.fn().mockResolvedValue(mockCredentials),
    revoke: jest.fn().mockResolvedValue(mockCredentials),
  },
  credentialsManager: {
    getCredentials: jest.fn().mockResolvedValue(mockCredentials),
    clearCredentials: jest.fn().mockResolvedValue(),
    saveCredentials: jest.fn().mockResolvedValue(),
    hasValidCredentials: jest.fn(),
  },
};

jest.mock('../../auth0', () => {
  return jest.fn().mockImplementation(() => mockAuth0);
});

describe('The useAuth0 hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuth0.credentialsManager.hasValidCredentials.mockResolvedValue(false);
  });

  it('defines error', () => {
    const { result } = renderHook(() => useAuth0());
    expect(result.current.error).toBeNull();
  });

  it('defines user', () => {
    const { result } = renderHook(() => useAuth0());
    expect(result.current.user).toBeNull();
  });

  it('defines authorize', () => {
    const { result } = renderHook(() => useAuth0());
    expect(result.current.authorize).toBeDefined();
  });

  it('defines clearSession', () => {
    const { result } = renderHook(() => useAuth0());
    expect(result.current.clearSession).toBeDefined();
  });

  it('defines cancelWebAuth ', async () => {
    const { result } = renderHook(() => useAuth0(), {
      wrapper,
    });

    expect(result.current.cancelWebAuth()).toBeDefined();
  });

  it('isLoading is true until initialization finishes', async () => {
    const { result } = renderHook(() => useAuth0(), {
      wrapper,
    });
    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockAuth0.credentialsManager.getCredentials).not.toBeCalled();
    expect(mockAuth0.credentialsManager.hasValidCredentials).toBeCalledTimes(1);
    expect(result.current.user).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('isLoading flag set on start up with valid credentials', async () => {
    mockAuth0.credentialsManager.hasValidCredentials.mockResolvedValue(true);

    const { result } = renderHook(() => useAuth0(), {
      wrapper,
    });
    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.user).not.toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('isLoading flag set on when error is thrown while initializing', async () => {
    const errorToThrow = new Error('Error getting credentials');
    mockAuth0.credentialsManager.hasValidCredentials.mockResolvedValue(true);
    mockAuth0.credentialsManager.getCredentials.mockRejectedValue(errorToThrow);

    const { result } = renderHook(() => useAuth0(), {
      wrapper,
    });
    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe(errorToThrow);
    expect(result.current.isLoading).toBe(false);
  });

  it('does not initialize the user on start up without valid credentials', async () => {
    const { result } = renderHook(() => useAuth0(), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockAuth0.credentialsManager.getCredentials).not.toBeCalled();
    expect(mockAuth0.credentialsManager.hasValidCredentials).toBeCalledTimes(1);
    expect(result.current.user).toBeNull();
  });

  it('initializes the user on start up with valid credentials', async () => {
    mockAuth0.credentialsManager.hasValidCredentials.mockResolvedValue(true);
    mockAuth0.credentialsManager.getCredentials.mockResolvedValue(
      mockCredentials
    );

    const { result } = renderHook(() => useAuth0(), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.user).not.toBeNull();
  });

  it('throws an error when login is called without a wrapper', () => {
    const { result } = renderHook(() => useAuth0());

    expect(() => result.current.authorize()).toThrowError(
      /no provider was set/i
    );
  });

  it('throws an error when logout is called without a wrapper', () => {
    const { result } = renderHook(() => useAuth0());

    expect(() => result.current.clearSession()).toThrowError(
      /no provider was set/i
    );
  });

  it('can authorize', async () => {
    const { result } = renderHook(() => useAuth0(), {
      wrapper,
    });
    const promise = result.current.authorize();

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.user).not.toBeNull();
    expect(mockAuth0.webAuth.authorize).toBeCalled();
    expect(mockAuth0.credentialsManager.saveCredentials).toBeCalled();

    let credentials;
    await act(async () => {
      credentials = await promise;
    });
    expect(credentials).toEqual({
      idToken:
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiaXNzIjoiaHR0cHM6Ly9hdXRoMC5jb20iLCJhdWQiOiJjbGllbnQxMjMiLCJuYW1lIjoiVGVzdCBVc2VyIiwiZmFtaWx5X25hbWUiOiJVc2VyIiwicGljdHVyZSI6Imh0dHBzOi8vaW1hZ2VzL3BpYy5wbmcifQ==.c2lnbmF0dXJl',
      accessToken: 'ACCESS TOKEN',
    });
  });

  it('can authorize, passing through all parameters', async () => {
    const { result } = renderHook(() => useAuth0(), {
      wrapper,
    });

    const promise = result.current.authorize(
      {
        scope: 'custom-scope',
        audience: 'http://my-api',
        customParam: '1234',
      },
      {
        ephemeralSession: true,
      }
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockAuth0.webAuth.authorize).toHaveBeenCalledWith(
      {
        scope: 'custom-scope openid profile email',
        audience: 'http://my-api',
        customParam: '1234',
      },
      {
        ephemeralSession: true,
      }
    );
    let credentials;
    await act(async () => {
      credentials = await promise;
    });
    expect(credentials).toEqual({
      idToken:
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiaXNzIjoiaHR0cHM6Ly9hdXRoMC5jb20iLCJhdWQiOiJjbGllbnQxMjMiLCJuYW1lIjoiVGVzdCBVc2VyIiwiZmFtaWx5X25hbWUiOiJVc2VyIiwicGljdHVyZSI6Imh0dHBzOi8vaW1hZ2VzL3BpYy5wbmcifQ==.c2lnbmF0dXJl',
      accessToken: 'ACCESS TOKEN',
    });
  });

  it('can authorize, passing through all options', async () => {
    const { result } = renderHook(() => useAuth0(), {
      wrapper,
    });

    result.current.authorize(
      {},
      {
        ephemeralSession: true,
        customScheme: 'demo',
        leeway: 100,
        skipLegacyListener: false,
      }
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockAuth0.webAuth.authorize).toHaveBeenCalledWith(
      { scope: 'openid profile email' },
      {
        ephemeralSession: true,
        customScheme: 'demo',
        leeway: 100,
        skipLegacyListener: false,
      }
    );
  });

  it('adds the default scopes when none are specified', async () => {
    const { result } = renderHook(() => useAuth0(), {
      wrapper,
    });

    result.current.authorize();

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockAuth0.webAuth.authorize).toHaveBeenCalledWith(
      {
        scope: 'openid profile email',
      },
      {}
    );
  });

  it('adds the default scopes when some are specified with custom scope', async () => {
    const { result } = renderHook(() => useAuth0(), {
      wrapper,
    });

    result.current.authorize({ scope: 'custom-scope openid' });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockAuth0.webAuth.authorize).toHaveBeenCalledWith(
      {
        scope: 'custom-scope openid profile email',
      },
      {}
    );
  });

  it('does not duplicate default scopes', async () => {
    const { result } = renderHook(() => useAuth0(), {
      wrapper,
    });

    result.current.authorize({
      scope: 'openid profile',
      audience: 'http://my-api',
      customParam: '1234',
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockAuth0.webAuth.authorize).toHaveBeenCalledWith(
      {
        scope: 'openid profile email',
        audience: 'http://my-api',
        customParam: '1234',
      },
      {}
    );
  });

  it('sets the user prop after authorizing', async () => {
    const { result } = renderHook(() => useAuth0(), {
      wrapper,
    });

    result.current.authorize();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.user).toMatchObject({
      name: 'Test User',
      familyName: 'User',
      picture: 'https://images/pic.png',
    });
  });

  it('does not set user prop when authorization fails', async () => {
    mockAuth0.webAuth.authorize.mockRejectedValue(mockAuthError);
    const { result } = renderHook(() => useAuth0(), {
      wrapper,
    });

    result.current.authorize();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.user).toBeNull();
    expect(result.current.error).toBe(mockAuthError);
  });

  it('sends SMS code', async () => {
    const { result } = renderHook(() => useAuth0(), {
      wrapper,
    });

    result.current.sendSMSCode();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockAuth0.auth.passwordlessWithSMS).toHaveBeenCalled();
  });

  it('can authorize with SMS, passing through all parameters', async () => {
    const { result } = renderHook(() => useAuth0(), {
      wrapper,
    });

    let promise = result.current.authorizeWithSMS({
      phoneNumber: '+11234567890',
      code: '123456',
      scope: 'custom-scope',
      audience: 'http://my-api',
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockAuth0.auth.loginWithSMS).toHaveBeenCalledWith({
      phoneNumber: '+11234567890',
      code: '123456',
      scope: 'custom-scope openid profile email',
      audience: 'http://my-api',
    });

    let credentials;
    await act(async () => {
      credentials = await promise;
    });
    expect(credentials).toEqual({
      idToken:
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiaXNzIjoiaHR0cHM6Ly9hdXRoMC5jb20iLCJhdWQiOiJjbGllbnQxMjMiLCJuYW1lIjoiVGVzdCBVc2VyIiwiZmFtaWx5X25hbWUiOiJVc2VyIiwicGljdHVyZSI6Imh0dHBzOi8vaW1hZ2VzL3BpYy5wbmcifQ==.c2lnbmF0dXJl',
      accessToken: 'ACCESS TOKEN',
    });
  });

  it('adds the default scopes when none are specified for SMS login', async () => {
    const { result } = renderHook(() => useAuth0(), {
      wrapper,
    });

    result.current.authorizeWithSMS();

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockAuth0.auth.loginWithSMS).toHaveBeenCalledWith({
      scope: 'openid profile email',
    });
  });

  it('adds the default scopes when some are specified with custom scope for SMS login', async () => {
    const { result } = renderHook(() => useAuth0(), {
      wrapper,
    });

    result.current.authorizeWithSMS({ scope: 'custom-scope openid' });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockAuth0.auth.loginWithSMS).toHaveBeenCalledWith({
      scope: 'custom-scope openid profile email',
    });
  });

  it('does not duplicate default scopes for SMS login', async () => {
    const { result } = renderHook(() => useAuth0(), {
      wrapper,
    });

    result.current.authorizeWithSMS({
      scope: 'openid profile',
      audience: 'http://my-api',
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockAuth0.auth.loginWithSMS).toHaveBeenCalledWith({
      scope: 'openid profile email',
      audience: 'http://my-api',
    });
  });

  it('sets the user prop after authorizing with SMS', async () => {
    const { result } = renderHook(() => useAuth0(), {
      wrapper,
    });

    result.current.authorizeWithSMS();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.user).toMatchObject({
      name: 'Test User',
      familyName: 'User',
      picture: 'https://images/pic.png',
    });
  });

  it('does not set user prop when SMS authorization fails', async () => {
    mockAuth0.auth.loginWithSMS.mockRejectedValue(mockAuthError);
    const { result } = renderHook(() => useAuth0(), {
      wrapper,
    });

    result.current.authorizeWithSMS();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.user).toBeNull();
    expect(result.current.error).toBe(mockAuthError);
  });

  it('sends email code', async () => {
    const { result } = renderHook(() => useAuth0(), {
      wrapper,
    });

    result.current.sendEmailCode();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockAuth0.auth.passwordlessWithEmail).toHaveBeenCalled();
  });

  it('can authorize with email, passing through all parameters', async () => {
    const { result } = renderHook(() => useAuth0(), {
      wrapper,
    });

    let promise = result.current.authorizeWithEmail({
      email: 'foo@gmail.com',
      code: '123456',
      scope: 'custom-scope',
      audience: 'http://my-api',
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockAuth0.auth.loginWithEmail).toHaveBeenCalledWith({
      email: 'foo@gmail.com',
      code: '123456',
      scope: 'custom-scope openid profile email',
      audience: 'http://my-api',
    });

    let credentials;
    await act(async () => {
      credentials = await promise;
    });
    expect(credentials).toEqual({
      idToken:
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiaXNzIjoiaHR0cHM6Ly9hdXRoMC5jb20iLCJhdWQiOiJjbGllbnQxMjMiLCJuYW1lIjoiVGVzdCBVc2VyIiwiZmFtaWx5X25hbWUiOiJVc2VyIiwicGljdHVyZSI6Imh0dHBzOi8vaW1hZ2VzL3BpYy5wbmcifQ==.c2lnbmF0dXJl',
      accessToken: 'ACCESS TOKEN',
    });
  });

  it('adds the default scopes when none are specified for email login', async () => {
    const { result } = renderHook(() => useAuth0(), {
      wrapper,
    });

    result.current.authorizeWithEmail();

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockAuth0.auth.loginWithEmail).toHaveBeenCalledWith({
      scope: 'openid profile email',
    });
  });

  it('adds the default scopes when some are specified with custom scope for email login', async () => {
    const { result } = renderHook(() => useAuth0(), {
      wrapper,
    });

    result.current.authorizeWithEmail({ scope: 'custom-scope openid' });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockAuth0.auth.loginWithEmail).toHaveBeenCalledWith({
      scope: 'custom-scope openid profile email',
    });
  });

  it('does not duplicate default scopes for email login', async () => {
    const { result } = renderHook(() => useAuth0(), {
      wrapper,
    });

    result.current.authorizeWithEmail({
      scope: 'openid profile',
      audience: 'http://my-api',
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockAuth0.auth.loginWithEmail).toHaveBeenCalledWith({
      scope: 'openid profile email',
      audience: 'http://my-api',
    });
  });

  it('sets the user prop after authorizing with email', async () => {
    const { result } = renderHook(() => useAuth0(), {
      wrapper,
    });

    result.current.authorizeWithEmail();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.user).toMatchObject({
      name: 'Test User',
      familyName: 'User',
      picture: 'https://images/pic.png',
    });
  });

  it('does not set user prop when email authorization fails', async () => {
    mockAuth0.auth.loginWithEmail.mockRejectedValue(mockAuthError);
    const { result } = renderHook(() => useAuth0(), {
      wrapper,
    });

    result.current.authorizeWithEmail();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.user).toBeNull();
    expect(result.current.error).toBe(mockAuthError);
  });

  it('sends multifactor challenge code', async () => {
    const { result } = renderHook(() => useAuth0(), {
      wrapper,
    });

    result.current.sendMultifactorChallenge();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockAuth0.auth.multifactorChallenge).toHaveBeenCalled();
  });

  it('can authorize with OOB, passing through all parameters', async () => {
    const { result } = renderHook(() => useAuth0(), {
      wrapper,
    });

    let promise = result.current.authorizeWithOOB({
      mfaToken: 'mfa_token',
      oobCode: 'oob_code',
      bindingCode: 'binding_code',
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockAuth0.auth.loginWithOOB).toHaveBeenCalledWith({
      mfaToken: 'mfa_token',
      oobCode: 'oob_code',
      bindingCode: 'binding_code',
    });

    let credentials;
    await act(async () => {
      credentials = await promise;
    });
    expect(credentials).toEqual({
      idToken:
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiaXNzIjoiaHR0cHM6Ly9hdXRoMC5jb20iLCJhdWQiOiJjbGllbnQxMjMiLCJuYW1lIjoiVGVzdCBVc2VyIiwiZmFtaWx5X25hbWUiOiJVc2VyIiwicGljdHVyZSI6Imh0dHBzOi8vaW1hZ2VzL3BpYy5wbmcifQ==.c2lnbmF0dXJl',
      accessToken: 'ACCESS TOKEN',
    });
  });

  it('sets the user prop after authorizing with OOB', async () => {
    const { result } = renderHook(() => useAuth0(), {
      wrapper,
    });

    result.current.authorizeWithOOB();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.user).toMatchObject({
      name: 'Test User',
      familyName: 'User',
      picture: 'https://images/pic.png',
    });
  });

  it('does not set user prop when OOB authorization fails', async () => {
    mockAuth0.auth.loginWithOOB.mockRejectedValue(mockAuthError);
    const { result } = renderHook(() => useAuth0(), {
      wrapper,
    });

    result.current.authorizeWithOOB();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.user).toBeNull();
    expect(result.current.error).toBe(mockAuthError);
  });

  it('can authorize with OTP, passing through all parameters', async () => {
    const { result } = renderHook(() => useAuth0(), {
      wrapper,
    });

    let promise = result.current.authorizeWithOTP({
      mfaToken: 'mfa_token',
      otp: 'otp',
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockAuth0.auth.loginWithOTP).toHaveBeenCalledWith({
      mfaToken: 'mfa_token',
      otp: 'otp',
    });

    let credentials;
    await act(async () => {
      credentials = await promise;
    });
    expect(credentials).toEqual({
      idToken:
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiaXNzIjoiaHR0cHM6Ly9hdXRoMC5jb20iLCJhdWQiOiJjbGllbnQxMjMiLCJuYW1lIjoiVGVzdCBVc2VyIiwiZmFtaWx5X25hbWUiOiJVc2VyIiwicGljdHVyZSI6Imh0dHBzOi8vaW1hZ2VzL3BpYy5wbmcifQ==.c2lnbmF0dXJl',
      accessToken: 'ACCESS TOKEN',
    });
  });

  it('sets the user prop after authorizing with OTP', async () => {
    const { result } = renderHook(() => useAuth0(), {
      wrapper,
    });

    result.current.authorizeWithOTP();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.user).toMatchObject({
      name: 'Test User',
      familyName: 'User',
      picture: 'https://images/pic.png',
    });
  });

  it('does not set user prop when OTP authorization fails', async () => {
    mockAuth0.auth.loginWithOTP.mockRejectedValue(mockAuthError);
    const { result } = renderHook(() => useAuth0(), {
      wrapper,
    });

    result.current.authorizeWithOTP();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.user).toBeNull();
    expect(result.current.error).toBe(mockAuthError);
  });

  it('can authorize with recover code, passing through all parameters', async () => {
    const { result } = renderHook(() => useAuth0(), {
      wrapper,
    });

    let promise = result.current.authorizeWithRecoveryCode({
      mfaToken: 'mfa_token',
      recoveryCode: 'recovery_code',
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockAuth0.auth.loginWithRecoveryCode).toHaveBeenCalledWith({
      mfaToken: 'mfa_token',
      recoveryCode: 'recovery_code',
    });

    let credentials;
    await act(async () => {
      credentials = await promise;
    });
    expect(credentials).toEqual({
      idToken:
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiaXNzIjoiaHR0cHM6Ly9hdXRoMC5jb20iLCJhdWQiOiJjbGllbnQxMjMiLCJuYW1lIjoiVGVzdCBVc2VyIiwiZmFtaWx5X25hbWUiOiJVc2VyIiwicGljdHVyZSI6Imh0dHBzOi8vaW1hZ2VzL3BpYy5wbmcifQ==.c2lnbmF0dXJl',
      accessToken: 'ACCESS TOKEN',
    });
  });

  it('sets the user prop after authorizing with recovery code', async () => {
    const { result } = renderHook(() => useAuth0(), {
      wrapper,
    });

    result.current.authorizeWithRecoveryCode();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.user).toMatchObject({
      name: 'Test User',
      familyName: 'User',
      picture: 'https://images/pic.png',
    });
  });

  it('does not set user prop when recovery code authorization fails', async () => {
    mockAuth0.auth.loginWithRecoveryCode.mockRejectedValue(mockAuthError);
    const { result } = renderHook(() => useAuth0(), {
      wrapper,
    });

    result.current.authorizeWithRecoveryCode();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.user).toBeNull();
    expect(result.current.error).toBe(mockAuthError);
  });

  it('can authorize with password realm, passing through all parameters', async () => {
    const { result } = renderHook(() => useAuth0(), {
      wrapper,
    });

    let promise = result.current.authorizeWithPasswordRealm({
      username: 'foo@gmail.com',
      password: 'random-password',
      realm: 'react-native-sample-app',
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockAuth0.auth.passwordRealm).toHaveBeenCalledWith({
      username: 'foo@gmail.com',
      password: 'random-password',
      realm: 'react-native-sample-app',
    });

    let credentials;
    await act(async () => {
      credentials = await promise;
    });
    expect(credentials).toEqual({
      idToken:
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiaXNzIjoiaHR0cHM6Ly9hdXRoMC5jb20iLCJhdWQiOiJjbGllbnQxMjMiLCJuYW1lIjoiVGVzdCBVc2VyIiwiZmFtaWx5X25hbWUiOiJVc2VyIiwicGljdHVyZSI6Imh0dHBzOi8vaW1hZ2VzL3BpYy5wbmcifQ==.c2lnbmF0dXJl',
      accessToken: 'ACCESS TOKEN',
    });
  });

  it('sets the user prop after successful authentication', async () => {
    const { result } = renderHook(() => useAuth0(), {
      wrapper,
    });

    result.current.authorizeWithPasswordRealm();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.user).toMatchObject({
      name: 'Test User',
      familyName: 'User',
      picture: 'https://images/pic.png',
    });
  });

  it('does not set user prop when authentication fails', async () => {
    mockAuth0.auth.passwordRealm.mockRejectedValue(mockAuthError);
    const { result } = renderHook(() => useAuth0(), {
      wrapper,
    });

    result.current.authorizeWithPasswordRealm();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.user).toBeNull();
    expect(result.current.error).toBe(mockAuthError);
  });

  it('can authorize with exchange social native, passing through all parameters', async () => {
    const { result } = renderHook(() => useAuth0(), {
      wrapper,
    });

    let promise = result.current.authorizeWithExchangeNativeSocial({
      subjectToken: 'subject-token',
      subjectTokenType: 'urn:ietf:params:oauth:token-type:access_token',
      userProfile: JSON.stringify({
        name: {
          firstName: 'John',
          lastName: 'Smith',
        },
      }),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockAuth0.auth.exchangeNativeSocial).toHaveBeenCalledWith({
      subjectToken: 'subject-token',
      subjectTokenType: 'urn:ietf:params:oauth:token-type:access_token',
      userProfile: JSON.stringify({
        name: {
          firstName: 'John',
          lastName: 'Smith',
        },
      }),
    });

    let credentials;
    await act(async () => {
      credentials = await promise;
    });
    expect(credentials).toEqual({
      idToken:
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiaXNzIjoiaHR0cHM6Ly9hdXRoMC5jb20iLCJhdWQiOiJjbGllbnQxMjMiLCJuYW1lIjoiVGVzdCBVc2VyIiwiZmFtaWx5X25hbWUiOiJVc2VyIiwicGljdHVyZSI6Imh0dHBzOi8vaW1hZ2VzL3BpYy5wbmcifQ==.c2lnbmF0dXJl',
      accessToken: 'ACCESS TOKEN',
    });
  });

  it('sets the user prop after successful authentication', async () => {
    const { result } = renderHook(() => useAuth0(), {
      wrapper,
    });

    result.current.authorizeWithExchangeNativeSocial();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.user).toMatchObject({
      name: 'Test User',
      familyName: 'User',
      picture: 'https://images/pic.png',
    });
  });

  it('does not set user prop when authentication fails', async () => {
    mockAuth0.auth.exchangeNativeSocial.mockRejectedValue(mockAuthError);
    const { result } = renderHook(() => useAuth0(), {
      wrapper,
    });

    result.current.authorizeWithExchangeNativeSocial();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.user).toBeNull();
    expect(result.current.error).toBe(mockAuthError);
  });

  it('can revoke refresh tokens, passing through all parameters', async () => {
    const { result } = renderHook(() => useAuth0(), {
      wrapper,
    });

    let promise = result.current.revokeRefreshToken({
      refreshToken: 'dummyToken',
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockAuth0.auth.revoke).toHaveBeenCalledWith({
      refreshToken: 'dummyToken',
    });
  });

  it('can clear the session', async () => {
    const { result } = renderHook(() => useAuth0(), {
      wrapper,
    });

    result.current.clearSession();
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.user).toBeNull();
    expect(mockAuth0.webAuth.clearSession).toHaveBeenCalled();
    expect(mockAuth0.credentialsManager.clearCredentials).toHaveBeenCalled();
  });

  it('can clear the session and pass parameters', async () => {
    const { result } = renderHook(() => useAuth0(), {
      wrapper,
    });

    result.current.clearSession({ parameter: 1 });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockAuth0.webAuth.clearSession).toHaveBeenCalledWith(
      {
        parameter: 1,
      },
      {}
    );
  });

  it('can clear the credentials', async () => {
    const { result } = renderHook(() => useAuth0(), {
      wrapper,
    });

    act(() => {
      result.current.clearCredentials();
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockAuth0.credentialsManager.clearCredentials).toHaveBeenCalled();
  });

  it('sets the error property when an error is raised in clearing credentials', async () => {
    const { result } = renderHook(() => useAuth0(), {
      wrapper,
    });
    const errorToThrow = new Error('Error clearing credentials');

    mockAuth0.credentialsManager.clearCredentials.mockRejectedValue(
      errorToThrow
    );

    result.current.clearCredentials();
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBe(errorToThrow);
  });

  it('clears the error on successful logout when clearing credentials', async () => {
    const { result } = renderHook(() => useAuth0(), {
      wrapper,
    });
    const errorToThrow = new Error('Error clearing credentials');

    mockAuth0.credentialsManager.clearCredentials.mockRejectedValueOnce(
      errorToThrow
    );
    mockAuth0.credentialsManager.clearCredentials.mockResolvedValue();

    // First call will fail and set an error
    await act(async () => {
      await result.current.clearCredentials();
    });

    await waitFor(() => expect(result.current.error).toBe(errorToThrow));

    // Second call should succeed and clear the error
    await act(async () => {
      await result.current.clearCredentials();
    });

    await waitFor(() => expect(result.current.error).toBeNull());
  });

  it('sets the error property when an error is raised in authorize', async () => {
    const { result } = renderHook(() => useAuth0(), {
      wrapper,
    });
    const errorToThrow = new Error('Authorize error');

    mockAuth0.webAuth.authorize.mockRejectedValue(errorToThrow);

    result.current.authorize();
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBe(errorToThrow);
  });

  it('clears the error on successful login', async () => {
    const { result } = renderHook(() => useAuth0(), {
      wrapper,
    });
    const errorToThrow = new Error('Authorize error');

    mockAuth0.webAuth.authorize.mockRejectedValueOnce(errorToThrow);
    mockAuth0.webAuth.authorize.mockResolvedValue(mockCredentials);

    result.current.authorize();

    await waitFor(() => expect(result.current.error).toBe(errorToThrow));

    result.current.authorize();

    await waitFor(() => expect(result.current.error).toBeNull());
  });

  it('sets the error property when an error is raised in clearSession', async () => {
    const { result } = renderHook(() => useAuth0(), {
      wrapper,
    });
    const errorToThrow = new Error('Authorize error');

    mockAuth0.webAuth.clearSession.mockRejectedValue(errorToThrow);

    result.current.clearSession();
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBe(errorToThrow);
  });

  it('clears the error on successful logout', async () => {
    const { result } = renderHook(() => useAuth0(), {
      wrapper,
    });
    const errorToThrow = new Error('Authorize error');

    mockAuth0.webAuth.clearSession.mockRejectedValueOnce(errorToThrow);
    mockAuth0.webAuth.clearSession.mockResolvedValue();
    mockAuth0.credentialsManager.clearCredentials.mockResolvedValue();

    result.current.clearSession();
    await waitFor(() => expect(result.current.error).toBe(errorToThrow));

    result.current.clearSession();
    await waitFor(() => expect(result.current.error).toBeNull());
  });

  it('can get credentials', async () => {
    const { result } = renderHook(() => useAuth0(), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    let credentials;
    await act(async () => {
      credentials = await result.current.getCredentials();
    });
    expect(credentials).toMatchObject(mockCredentials);
  });

  it('can get credentials with options', async () => {
    const { result } = renderHook(() => useAuth0(), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let credentials;
    await act(async () => {
      credentials = await result.current.getCredentials('read:books', 60, {
        hello: 'world',
      });
    });
    expect(credentials).toMatchObject(mockCredentials);

    expect(mockAuth0.credentialsManager.getCredentials).toHaveBeenCalledWith(
      'read:books',
      60,
      {
        hello: 'world',
      },
      false
    );
  });

  it('can get credentials and update user when id token is present', async () => {
    const { result } = renderHook(() => useAuth0(), {
      wrapper,
    });
    act(() => {
      result.current.authorize();
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.user).toMatchObject({
      name: 'Test User',
      familyName: 'User',
      picture: 'https://images/pic.png',
    });

    mockAuth0.credentialsManager.getCredentials.mockResolvedValue(
      updatedMockCredentialsWithIdToken
    );

    // Use act to handle the state update
    await act(async () => {
      await result.current.getCredentials();
    });

    // Now wait for the user to be updated before checking
    await waitFor(() =>
      expect(result.current.user?.name).toBe('Different User')
    );

    expect(result.current.user).toMatchObject({
      name: 'Different User',
      familyName: 'User',
      picture: 'https://images/pic.png',
    });
  });

  it('can get credentials and not update user when id token is not present', async () => {
    const { result } = renderHook(() => useAuth0(), {
      wrapper,
    });
    act(() => {
      result.current.authorize();
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.user).toMatchObject({
      name: 'Test User',
      familyName: 'User',
      picture: 'https://images/pic.png',
    });

    mockAuth0.credentialsManager.getCredentials.mockResolvedValue(
      updatedMockCredentialsWithoutIdToken
    );
    result.current.getCredentials();
    expect(result.current.user).toMatchObject({
      name: 'Test User',
      familyName: 'User',
      picture: 'https://images/pic.png',
    });
  });

  it('can get credentials and not update user when same as before', async () => {
    const { result } = renderHook(() => useAuth0(), {
      wrapper,
    });
    act(() => {
      result.current.authorize();
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    let userReference = result.current.user;
    expect(result.current.user).toMatchObject({
      name: 'Test User',
      familyName: 'User',
      picture: 'https://images/pic.png',
    });

    mockAuth0.credentialsManager.getCredentials.mockResolvedValue(
      mockCredentials
    );
    await act(async () => {
      await result.current.getCredentials();
    });
    expect(result.current.user).toBe(userReference);
  });

  it('dispatches an error when getCredentials fails', async () => {
    const { result } = renderHook(() => useAuth0(), {
      wrapper,
    });
    const thrownError = new Error('Get credentials failed');

    mockAuth0.credentialsManager.getCredentials.mockRejectedValue(thrownError);

    act(() => {
      result.current.getCredentials();
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toEqual(thrownError);
  });

  it('calls hasValidCredentials with correct parameters', async () => {
    const { result } = renderHook(() => useAuth0(), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    result.current.hasValidCredentials(100);

    expect(
      mockAuth0.credentialsManager.hasValidCredentials
    ).toHaveBeenCalledWith(100);
  });
});

describe('The Auth0Provider component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    mockAuth0.credentialsManager.hasValidCredentials.mockResolvedValue(false);
  });

  it('should pass custom headers to Auth0 client when provided', () => {
    // Save the original mock implementation
    const originalMockImplementation =
      require('../../auth0').mockImplementation;

    // Override the mock for this specific test
    const mockAuth0Constructor = require('../../auth0');
    mockAuth0Constructor.mockImplementation((options) => {
      // Capture the options passed to the Auth0 constructor
      mockAuth0Constructor.mockOptions = options;
      // Return the standard mockAuth0 object
      return mockAuth0;
    });

    const customHeaders = { 'X-Custom-Header': 'custom-value' };

    const customHeadersWrapper = ({ children }) => (
      <Auth0Provider
        domain="DOMAIN"
        clientId="CLIENT ID"
        headers={customHeaders}
      >
        {children}
      </Auth0Provider>
    );

    renderHook(() => useAuth0(), { wrapper: customHeadersWrapper });

    // Verify headers were passed correctly
    expect(mockAuth0Constructor.mockOptions).toEqual(
      expect.objectContaining({
        headers: customHeaders,
      })
    );

    // Restore the original mock implementation
    mockAuth0Constructor.mockImplementation(originalMockImplementation);
  });
});
