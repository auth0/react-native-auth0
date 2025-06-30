import type { Int32 } from 'react-native/Libraries/Types/CodegenTypes';
import type { Spec } from './NativeA0Auth0';
import type { CredentialsResponse } from '../internal-types';

export default {
  getBundleIdentifier: function (): Promise<string> {
    throw new Error('Function not implemented.');
  },
  hasValidAuth0InstanceWithConfiguration: function (): Promise<boolean> {
    throw new Error('Function not implemented.');
  },
  initializeAuth0WithConfiguration: function (): Promise<void> {
    throw new Error('Function not implemented.');
  },
  saveCredentials: function (): Promise<void> {
    throw new Error('Function not implemented.');
  },
  getCredentials: function (
    scope: string | undefined,
    minTTL: Int32,
    parameters: Object,
    forceRefresh: boolean
  ): Promise<Credentials> {
    throw new Error('Function not implemented.');
  },
  hasValidCredentials: function (minTTL: Int32): Promise<boolean> {
    throw new Error('Function not implemented.');
  },
  clearCredentials: function (): Promise<void> {
    throw new Error('Function not implemented.');
  },
  webAuth: function (
    scheme: string,
    redirectUri: string,
    state: string | undefined,
    nonce: string | undefined,
    audience: string | undefined,
    scope: string | undefined,
    connection: string | undefined,
    maxAge: Int32 | undefined,
    organization: string | undefined,
    invitationUrl: string | undefined,
    leeway: Int32 | undefined,
    ephemeralSession: boolean | undefined,
    safariViewControllerPresentationStyle: Int32 | undefined,
    additionalParameters: { [key: string]: string } | undefined
  ): Promise<CredentialsResponse> {
    throw new Error('Function not implemented.');
  },
  webAuthLogout: function (
    scheme: string,
    federated: boolean,
    redirectUri: string
  ): Promise<void> {
    throw new Error('Function not implemented.');
  },
  resumeWebAuth: function (url: string): Promise<void> {
    throw new Error('Function not implemented.');
  },
  cancelWebAuth: function (): Promise<void> {
    throw new Error('Function not implemented.');
  },
} satisfies Spec;
