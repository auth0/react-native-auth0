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

const mockAuthorize = jest.fn().mockImplementation(() => ({
  idToken: mockIdToken,
  accessToken: 'ACCESS TOKEN',
}));

const wrapper = ({children}) => (
  <Auth0Provider domain="DOMAIN" clientId="CLIENT ID">
    {children}
  </Auth0Provider>
);

jest.mock('../../../index', () => {
  return jest.fn().mockImplementation(() => ({
    webAuth: {
      authorize: mockAuthorize,
    },
  }));
});

describe('The useAuth0 hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns isLoading', () => {
    const {result} = renderHook(() => useAuth0());
    expect(result.current.isLoading).toEqual(true);
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

  it('defines logout', () => {
    const {result} = renderHook(() => useAuth0());
    expect(result.current.logout).toBeDefined();
  });

  it('can log in', async () => {
    const {result, waitForNextUpdate} = renderHook(() => useAuth0(), {wrapper});

    result.current.authorize();
    await waitForNextUpdate();
    expect(result.current.user).not.toBeNull();
  });

  it('can log in, passing through all parameters', async () => {
    const {result, waitForNextUpdate} = renderHook(() => useAuth0(), {wrapper});

    result.current.authorize({
      scope: 'custom-scope',
      audience: 'http://my-api',
      customParam: '1234',
    });

    await waitForNextUpdate();

    expect(mockAuthorize).toHaveBeenCalledWith({
      scope: 'custom-scope',
      audience: 'http://my-api',
      customParam: '1234',
    });
  });
});
