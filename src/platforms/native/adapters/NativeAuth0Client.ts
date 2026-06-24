import type {
  IAuth0Client,
  IAuthenticationProvider,
  IMyAccountClient,
  IUsersClient,
  IMfaClient,
} from '../../../core/interfaces';
import type { NativeAuth0Options } from '../../../types/platform-specific';
import type {
  DPoPHeadersParams,
  CustomTokenExchangeParameters,
  PasskeySignupChallengeParameters,
  PasskeyLoginChallengeParameters,
  PasskeyChallengeResponse,
  GetTokenByPasskeyParameters,
  Credentials,
} from '../../../types';
import { NativeWebAuthProvider } from './NativeWebAuthProvider';
import { NativeCredentialsManager } from './NativeCredentialsManager';
import { NativeMfaClient } from './NativeMfaClient';
import { NativeMyAccountClient } from './NativeMyAccountClient';
import { type INativeBridge, NativeBridgeManager } from '../bridge';
import {
  AuthenticationOrchestrator,
  ManagementApiOrchestrator,
} from '../../../core/services';
import { HttpClient } from '../../../core/services/HttpClient';
import { TokenType } from '../../../types/common';
import { AuthError, DPoPError, PasskeyError } from '../../../core/models';
import { getConfigSignature } from '../../../core/utils';

export class NativeAuth0Client implements IAuth0Client {
  readonly webAuth: NativeWebAuthProvider;
  readonly credentialsManager: NativeCredentialsManager;
  readonly auth: IAuthenticationProvider;
  readonly mfa: IMfaClient;
  private ready: Promise<void>;
  private readonly httpClient: HttpClient;
  private readonly tokenType: TokenType;
  private readonly bridge: INativeBridge;
  private readonly baseUrl: string;
  private readonly options: NativeAuth0Options;
  private readonly configSignature: string;
  private syncLock: Promise<void> = Promise.resolve();
  private guardedBridge!: INativeBridge;
  private readonly getDPoPHeadersForOrchestrator?: (
    params: DPoPHeadersParams
  ) => Promise<Record<string, string>>;

  // Signature last applied to the shared native singleton. `hasValidInstance`
  // only checks domain/clientId, so this tracks other identity options
  // (useDPoP, localAuthenticationOptions) to detect drift and re-init.
  private static appliedNativeSignature: string | null = null;

  constructor(options: NativeAuth0Options) {
    this.options = options;
    this.configSignature = getConfigSignature(options);
    const baseUrl = `https://${options.domain}`;
    this.baseUrl = baseUrl;
    const useDPoP = options.useDPoP ?? true;
    this.tokenType = useDPoP ? TokenType.dpop : TokenType.bearer;

    this.httpClient = new HttpClient({
      baseUrl: baseUrl,
      timeout: options.timeout,
      headers: options.headers,
    });

    const bridge = new NativeBridgeManager();
    this.bridge = bridge;

    // Create a bound getDPoPHeaders function for the orchestrator
    const getDPoPHeadersForOrchestrator = async (params: DPoPHeadersParams) => {
      await this.ready;
      return this.bridge.getDPoPHeaders(params);
    };
    this.getDPoPHeadersForOrchestrator = useDPoP
      ? getDPoPHeadersForOrchestrator
      : undefined;

    this.ready = this.initialize(bridge, options);

    // The adapters are now constructed with a "proxied" bridge that
    // automatically awaits the `ready` promise before any call.
    const guardedBridge = this.createGuardedBridge(bridge);
    this.guardedBridge = guardedBridge;

    // Use AuthenticationOrchestrator directly for standard auth methods
    this.auth = new AuthenticationOrchestrator({
      clientId: options.clientId,
      httpClient: this.httpClient,
      tokenType: this.tokenType,
      baseUrl: baseUrl,
      getDPoPHeaders: useDPoP ? getDPoPHeadersForOrchestrator : undefined,
    });

    this.webAuth = new NativeWebAuthProvider(guardedBridge, options.domain);
    this.credentialsManager = new NativeCredentialsManager(guardedBridge);
    this.mfa = new NativeMfaClient(guardedBridge);
    this.myAccount = new NativeMyAccountClient(guardedBridge);
  }

  private async initialize(
    bridge: INativeBridge,
    options: NativeAuth0Options
  ): Promise<void> {
    const {
      clientId,
      domain,
      localAuthenticationOptions,
      useDPoP = true,
      maxRetries,
      credentialsManagerStorageKey,
    } = options;
    // Re-init when domain/clientId differ (hasValidInstance) or any other
    // identity option drifted from what was last applied to the native side.
    const hasValidInstance = await bridge.hasValidInstance(clientId, domain);
    // Null signature means nothing applied yet, so defer to hasValidInstance
    // and let genuine remounts reuse the existing native instance.
    const signatureDrifted =
      NativeAuth0Client.appliedNativeSignature !== null &&
      NativeAuth0Client.appliedNativeSignature !== this.configSignature;
    if (!hasValidInstance || signatureDrifted) {
      await bridge.initialize(
        clientId,
        domain,
        localAuthenticationOptions,
        useDPoP,
        maxRetries,
        credentialsManagerStorageKey
      );
    }
    // Record even on the skip path so siblings differing only in a
    // native-invisible option (e.g. useDPoP) can detect drift.
    NativeAuth0Client.appliedNativeSignature = this.configSignature;
  }

  // Re-points the shared native singleton at this client's config before a
  // bridge call, in case a sibling client overwrote it. Re-init only on drift,
  // so the single-client path stays cheap. Serialized via syncLock.
  private syncNativeConfig(): Promise<void> {
    this.syncLock = this.syncLock
      .catch(() => undefined)
      .then(() => this.initialize(this.bridge, this.options));
    return this.syncLock;
  }

  users(token: string, tokenType?: TokenType): IUsersClient {
    // Use provided tokenType or fall back to client's default
    const effectiveTokenType = tokenType ?? this.tokenType;
    // Only provide getDPoPHeaders if the effective token type is DPoP
    const getDPoPHeaders =
      effectiveTokenType === TokenType.dpop
        ? this.getDPoPHeadersForOrchestrator
        : undefined;

    return new ManagementApiOrchestrator({
      token: token,
      httpClient: this.httpClient,
      tokenType: effectiveTokenType,
      baseUrl: this.baseUrl,
      getDPoPHeaders,
    });
  }

  readonly myAccount: IMyAccountClient;

  async getDPoPHeaders(
    params: DPoPHeadersParams
  ): Promise<Record<string, string>> {
    await this.ready;
    try {
      return await this.bridge.getDPoPHeaders(params);
    } catch (e) {
      // Wrap the error as a DPoPError if it's an AuthError
      if (e instanceof AuthError) {
        throw new DPoPError(e);
      }
      throw e;
    }
  }

  private createGuardedBridge(bridge: INativeBridge): INativeBridge {
    const guarded: any = {};

    // Get the prototype of the bridge instance to access its methods.
    const bridgePrototype = Object.getPrototypeOf(bridge);

    // Get all method names from the prototype.
    const methodNames = Object.getOwnPropertyNames(bridgePrototype).filter(
      (name) =>
        name !== 'constructor' &&
        typeof bridgePrototype[name] === 'function' &&
        name !== 'hasValidInstance' &&
        name !== 'initialize'
    );

    // Iterate over the method names and create the wrapped (guarded) functions.
    for (const methodName of methodNames) {
      const originalMethod = (bridge as any)[methodName];

      guarded[methodName] = async (...args: any[]) => {
        // This is the "guard": wait for the initialization promise to resolve.
        await this.ready;
        // Re-point the native singleton at this client's config in case a
        // sibling client (different domain/clientId) overwrote it. No-op when
        // the native instance already matches.
        await this.syncNativeConfig();
        // Call the original method with the correct 'this' context.
        return originalMethod.apply(bridge, args);
      };
    }

    return guarded as INativeBridge;
  }

  /**
   * Performs a Custom Token Exchange using RFC 8693.
   * Exchanges an external identity provider token for Auth0 tokens.
   *
   * This method delegates directly to the native SDK bridge.
   *
   * @param parameters The token exchange parameters.
   * @returns A promise resolving with Auth0 credentials.
   */
  async customTokenExchange(
    parameters: CustomTokenExchangeParameters
  ): Promise<Credentials> {
    const { subjectToken, subjectTokenType, audience, scope, organization } =
      parameters;
    return this.guardedBridge.customTokenExchange(
      subjectToken,
      subjectTokenType,
      audience,
      scope,
      organization
    );
  }

  async passkeySignupChallenge(
    parameters: PasskeySignupChallengeParameters
  ): Promise<PasskeyChallengeResponse> {
    const {
      email,
      phoneNumber,
      username,
      name,
      givenName,
      familyName,
      nickname,
      picture,
      userMetadata,
      realm,
      organization,
    } = parameters;
    try {
      return await this.guardedBridge.passkeySignupChallenge(
        email || undefined,
        phoneNumber || undefined,
        username || undefined,
        name || undefined,
        givenName || undefined,
        familyName || undefined,
        nickname || undefined,
        picture || undefined,
        userMetadata || undefined,
        realm || undefined,
        organization || undefined
      );
    } catch (e) {
      if (e instanceof AuthError) {
        throw new PasskeyError(e);
      }
      throw e;
    }
  }

  async passkeyLoginChallenge(
    parameters: PasskeyLoginChallengeParameters
  ): Promise<PasskeyChallengeResponse> {
    const { realm, organization } = parameters;
    try {
      return await this.guardedBridge.passkeyLoginChallenge(
        realm || undefined,
        organization || undefined
      );
    } catch (e) {
      if (e instanceof AuthError) {
        throw new PasskeyError(e);
      }
      throw e;
    }
  }

  async getTokenByPasskey(
    parameters: GetTokenByPasskeyParameters
  ): Promise<Credentials> {
    const { authSession, authResponse, realm, audience, scope, organization } =
      parameters;
    try {
      return await this.guardedBridge.getTokenByPasskey(
        authSession,
        authResponse,
        realm || undefined,
        audience || undefined,
        scope || undefined,
        organization || undefined
      );
    } catch (e) {
      if (e instanceof AuthError) {
        throw new PasskeyError(e);
      }
      throw e;
    }
  }
}
