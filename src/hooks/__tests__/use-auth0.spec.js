/**
 * @jest-environment jsdom
 */
import * as React from 'react';
import {renderHook} from '@testing-library/react-hooks';
import Auth0Provider from '../auth0-provider';
import useAuth0 from '../use-auth0';

function makeJwt(claims) {
  const header = {alg: 'RS256', typ: 'JWT'};

  const payload = {
    sub: '1',
    iss: 'https://auth0.com',
    aud: 'client123',
    name: 'Test User',
    family_name: 'User',
    picture: 'https://images/pic.png',
    ...(claims !== undefined ? {claims} : null),
  };

  // prettier-ignore
  return `${Buffer.from(JSON.stringify(header)).toString('base64')}.${Buffer.from(JSON.stringify(payload)).toString('base64')}.${Buffer.from('signature').toString('base64')}`;
}

const mockIdToken = makeJwt();

const mockCredentials = {
  idToken: mockIdToken,
  accessToken: 'ACCESS TOKEN',
};

const wrapper = ({children}) => (
  <Auth0Provider domain="DOMAIN" clientId="CLIENT ID">
    {children}
  </Auth0Provider>
);

const mockAuth0 = {
  webAuth: {
    authorize: jest.fn().mockResolvedValue(mockCredentials),
    clearSession: jest.fn().mockResolvedValue(),
  },
  credentialsManager: {
    getCredentials: jest.fn().mockResolvedValue(mockCredentials),
    requireLocalAuthentication: jest.fn().mockResolvedValue(),
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
    const {result} = renderHook(() => useAuth0());
    expect(result.current.error).toBeNull();
  });

  it('defines user', () => {
    const {result} = renderHook(() => useAuth0());
    expect(result.current.user).toBeNull();
  });

  it('defines authorize', () => {
    const {result} = renderHook(() => useAuth0());
    expect(result.current.authorize).toBeDefined();
  });

  it('defines clearSession', () => {
    const {result} = renderHook(() => useAuth0());
    expect(result.current.clearSession).toBeDefined();
  });

  it('does not initialize the user on start up without valid credentials', async () => {
    const {result, waitForNextUpdate} = renderHook(() => useAuth0(), {wrapper});

    await waitForNextUpdate();
    expect(mockAuth0.credentialsManager.getCredentials).not.toBeCalled();
    expect(mockAuth0.credentialsManager.hasValidCredentials).toBeCalledTimes(1);
    expect(result.current.user).toBeNull();
  });

  it('initializes the user on start up with valid credentials', async () => {
    mockAuth0.credentialsManager.hasValidCredentials.mockResolvedValue(true);

    const {result, waitForNextUpdate} = renderHook(() => useAuth0(), {wrapper});

    await waitForNextUpdate();
    expect(result.current.user).not.toBeNull();
  });

  it('throws an error when login is called without a wrapper', () => {
    const {result} = renderHook(() => useAuth0());

    expect(() => result.current.authorize()).toThrowError(
      /no provider was set/i,
    );
  });

  it('throws an error when logout is called without a wrapper', () => {
    const {result} = renderHook(() => useAuth0());

    expect(() => result.current.clearSession()).toThrowError(
      /no provider was set/i,
    );
  });

  it('can authorize', async () => {
    const {result, waitForNextUpdate} = renderHook(() => useAuth0(), {wrapper});
    result.current.authorize();

    await waitForNextUpdate();
    expect(result.current.user).not.toBeNull();
    expect(mockAuth0.webAuth.authorize).toBeCalled();
    expect(mockAuth0.credentialsManager.saveCredentials).toBeCalled();
  });

  it('can authorize, passing through all parameters', async () => {
    const {result, waitForNextUpdate} = renderHook(() => useAuth0(), {wrapper});

    result.current.authorize({
      scope: 'custom-scope',
      audience: 'http://my-api',
      customParam: '1234',
    });

    await waitForNextUpdate();

    expect(mockAuth0.webAuth.authorize).toHaveBeenCalledWith({
      scope: 'custom-scope openid profile email',
      audience: 'http://my-api',
      customParam: '1234',
    });
  });

  it('adds the default scopes when none are specified', async () => {
    const {result, waitForNextUpdate} = renderHook(() => useAuth0(), {wrapper});

    result.current.authorize();

    await waitForNextUpdate();

    expect(mockAuth0.webAuth.authorize).toHaveBeenCalledWith({
      scope: 'openid profile email',
    });
  });

  it('adds the default scopes when some are specified with custom scope', async () => {
    const {result, waitForNextUpdate} = renderHook(() => useAuth0(), {wrapper});

    result.current.authorize({scope: 'custom-scope openid'});

    await waitForNextUpdate();

    expect(mockAuth0.webAuth.authorize).toHaveBeenCalledWith({
      scope: 'custom-scope openid profile email',
    });
  });

  it('does not duplicate default scopes', async () => {
    const {result, waitForNextUpdate} = renderHook(() => useAuth0(), {wrapper});

    result.current.authorize({
      scope: 'openid profile',
      audience: 'http://my-api',
      customParam: '1234',
    });

    await waitForNextUpdate();

    expect(mockAuth0.webAuth.authorize).toHaveBeenCalledWith({
      scope: 'openid profile email',
      audience: 'http://my-api',
      customParam: '1234',
    });
  });

  it('sets the user prop after authorizing', async () => {
    const {result, waitForNextUpdate} = renderHook(() => useAuth0(), {wrapper});

    result.current.authorize();
    await waitForNextUpdate();

    expect(result.current.user).toMatchObject({
      name: 'Test User',
      family_name: 'User',
      picture: 'https://images/pic.png',
    });
  });

  it('can clear the session', async () => {
    const {result, waitForNextUpdate} = renderHook(() => useAuth0(), {wrapper});

    result.current.clearSession();
    await waitForNextUpdate();
    expect(result.current.user).toBeNull();
    expect(mockAuth0.webAuth.clearSession).toHaveBeenCalled();
    expect(mockAuth0.credentialsManager.clearCredentials).toHaveBeenCalled();
  });

  it('can clear the session and pass parameters', async () => {
    const {result, waitForNextUpdate} = renderHook(() => useAuth0(), {wrapper});

    result.current.clearSession({parameter: 1}, {option: 1});
    await waitForNextUpdate();

    expect(mockAuth0.webAuth.clearSession).toHaveBeenCalledWith(
      {parameter: 1},
      {option: 1},
    );
  });

  it('sets the error property when an error is raised in authorize', async () => {
    const {result, waitForNextUpdate} = renderHook(() => useAuth0(), {wrapper});
    const errorToThrow = new Error('Authorize error');

    mockAuth0.webAuth.authorize.mockRejectedValue(errorToThrow);

    result.current.authorize();
    await waitForNextUpdate();
    expect(result.current.error).toBe(errorToThrow);
  });

  it('clears the error on successful login', async () => {
    const {result, waitForNextUpdate} = renderHook(() => useAuth0(), {wrapper});
    const errorToThrow = new Error('Authorize error');

    mockAuth0.webAuth.authorize.mockRejectedValueOnce(errorToThrow);
    mockAuth0.webAuth.authorize.mockResolvedValue(mockCredentials);

    result.current.authorize();
    await waitForNextUpdate();
    expect(result.current.error).toBe(errorToThrow);
    result.current.authorize();
    await waitForNextUpdate();
    expect(result.current.error).toBeNull();
  });

  it('sets the error property when an error is raised in clearSession', async () => {
    const {result, waitForNextUpdate} = renderHook(() => useAuth0(), {wrapper});
    const errorToThrow = new Error('Authorize error');

    mockAuth0.webAuth.clearSession.mockRejectedValue(errorToThrow);

    result.current.clearSession();
    await waitForNextUpdate();
    expect(result.current.error).toBe(errorToThrow);
  });

  it('clears the error on successful logout', async () => {
    const {result, waitForNextUpdate} = renderHook(() => useAuth0(), {wrapper});
    const errorToThrow = new Error('Authorize error');

    mockAuth0.webAuth.clearSession.mockRejectedValueOnce(errorToThrow);
    mockAuth0.webAuth.clearSession.mockResolvedValue();

    result.current.clearSession();
    await waitForNextUpdate();
    expect(result.current.error).toBe(errorToThrow);
    result.current.clearSession();
    await waitForNextUpdate();
    expect(result.current.error).toBeNull();
  });

  it('can get credentials', async () => {
    const {result, waitForNextUpdate} = renderHook(() => useAuth0(), {wrapper});

    await waitForNextUpdate();

    expect(result.current.getCredentials()).resolves.toMatchObject(
      mockCredentials,
    );
  });

  it('can get credentials with options', async () => {
    const {result, waitForNextUpdate} = renderHook(() => useAuth0(), {wrapper});

    await waitForNextUpdate();

    expect(
      result.current.getCredentials('read:books', 60, {hello: 'world'}),
    ).resolves.toMatchObject(mockCredentials);

    expect(mockAuth0.credentialsManager.getCredentials).toHaveBeenCalledWith(
      'read:books',
      60,
      {
        hello: 'world',
      },
    );
  });

  it('dispatches an error when getCredentials fails', async () => {
    const {result, waitForNextUpdate} = renderHook(() => useAuth0(), {wrapper});
    const thrownError = new Error('Get credentials failed');

    mockAuth0.credentialsManager.getCredentials.mockRejectedValue(thrownError);

    result.current.getCredentials();
    await waitForNextUpdate();
    expect(result.current.error).toEqual(thrownError);
  });

  it('can require local authentication', async () => {
    const {result, waitForNextUpdate} = renderHook(() => useAuth0(), {wrapper});

    await waitForNextUpdate();

    result.current.requireLocalAuthentication();

    expect(
      mockAuth0.credentialsManager.requireLocalAuthentication,
    ).toHaveBeenCalled();
  });

  it('can require local authentication with options', async () => {
    const {result, waitForNextUpdate} = renderHook(() => useAuth0(), {wrapper});

    await waitForNextUpdate();

    result.current.requireLocalAuthentication(
      'title',
      'description',
      'cancel',
      'fallback',
    );

    expect(
      mockAuth0.credentialsManager.requireLocalAuthentication,
    ).toHaveBeenCalledWith('title', 'description', 'cancel', 'fallback');
  });

  it('dispatches an error when requireLocalAuthentication fails', async () => {
    const {result, waitForNextUpdate} = renderHook(() => useAuth0(), {wrapper});
    const thrownError = new Error('requireLocalAuthentication failed');

    mockAuth0.credentialsManager.requireLocalAuthentication.mockRejectedValue(
      thrownError,
    );

    result.current.requireLocalAuthentication();
    await waitForNextUpdate();
    expect(result.current.error).toEqual(thrownError);
  });
});
