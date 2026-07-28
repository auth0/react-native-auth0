import {
  Auth0Client,
  type Auth0ClientOptions,
  type LogoutOptions,
  type PasskeyCredentialResponse,
} from '@auth0/auth0-spa-js';
import type {
  IAuth0Client,
  IAuthenticationProvider,
  IMyAccountClient,
  IPasswordlessClient,
  IUsersClient,
  IMfaClient,
} from '../../../core/interfaces';
import type { WebAuth0Options } from '../../../types/platform-specific';
import type {
  DPoPHeadersParams,
  CustomTokenExchangeParameters,
  PasskeySignupChallengeParameters,
  PasskeyLoginChallengeParameters,
  PasskeyChallengeResponse,
  GetTokenByPasskeyParameters,
  Credentials,
} from '../../../types';
import { WebWebAuthProvider } from './WebWebAuthProvider';
import { WebCredentialsManager } from './WebCredentialsManager';
import { WebMfaClient } from './WebMfaClient';
import { WebMyAccountClient } from './WebMyAccountClient';
import { WebPasswordlessClient } from './WebPasswordlessClient';
import { ssoExchangeNotSupported } from './WebAuthenticationProvider';
import {
  AuthenticationOrchestrator,
  ManagementApiOrchestrator,
} from '../../../core/services';
import { HttpClient } from '../../../core/services/HttpClient';
import { TokenType } from '../../../types/common';
import { AuthError, DPoPError, PasskeyError } from '../../../core/models';
import {
  validateActorTokenParameters,
  validateTokenTypeUri,
} from '../../../core/utils';

export class WebAuth0Client implements IAuth0Client {
  readonly webAuth: WebWebAuthProvider;
  readonly credentialsManager: WebCredentialsManager;
  readonly auth: IAuthenticationProvider;
  readonly mfa: IMfaClient;
  readonly myAccount: IMyAccountClient;

  private readonly httpClient: HttpClient;
  private readonly tokenType: TokenType;
  private readonly baseUrl: string;
  private readonly getDPoPHeadersForOrchestrator?: (
    params: DPoPHeadersParams
  ) => Promise<Record<string, string>>;
  public readonly client: Auth0Client;
  private static spaClient: Auth0Client | null = null;

  private logoutInProgress = false;

  /**
   * Factory method to get a singleton instance of Auth0Client.
   * This ensures that the client is only created once and reused.
   *
   * @param options - The Auth0ClientOptions to configure the client.
   * @returns An instance of Auth0Client.
   */
  private static getSpaClient(options: Auth0ClientOptions): Auth0Client {
    if (WebAuth0Client.spaClient) {
      return WebAuth0Client.spaClient;
    }
    WebAuth0Client.spaClient = new Auth0Client(options);
    return WebAuth0Client.spaClient;
  }

  /**
   * Reset the singleton instance. Used for testing purposes.
   * @internal
   */
  public static resetSpaClientSingleton(): void {
    WebAuth0Client.spaClient = null;
  }

  constructor(options: WebAuth0Options) {
    const baseUrl = `https://${options.domain}`;
    this.baseUrl = baseUrl;
    const useDPoP = options.useDPoP ?? true;
    this.tokenType = useDPoP ? TokenType.dpop : TokenType.bearer;

    this.httpClient = new HttpClient({
      baseUrl: baseUrl,
      timeout: options.timeout,
      headers: options.headers,
    });

    const clientOptions: Auth0ClientOptions = {
      domain: options.domain,
      clientId: options.clientId,
      useMrrt: options.useMrrt,
      cacheLocation: options.cacheLocation ?? 'memory',
      // MRRT requires refresh tokens to work - automatically enable if useMrrt is true
      useRefreshTokens: options.useRefreshTokens ?? options.useMrrt ?? false,
      useRefreshTokensFallback: options.useRefreshTokensFallback ?? true,
      useDpop: options.useDPoP ?? true,
      authorizationParams: {
        redirect_uri:
          typeof window !== 'undefined' ? window.location.origin : '',
        ...options,
      },
    };

    // Use the singleton factory to get the spa-js client instance.
    const client = WebAuth0Client.getSpaClient(clientOptions);
    this.client = client;

    // Create a bound getDPoPHeaders function for the orchestrator
    const getDPoPHeadersForOrchestrator = async (params: DPoPHeadersParams) => {
      return this.getDPoPHeaders(params);
    };
    this.getDPoPHeadersForOrchestrator = useDPoP
      ? getDPoPHeadersForOrchestrator
      : undefined;

    const orchestrator = new AuthenticationOrchestrator({
      clientId: options.clientId,
      httpClient: this.httpClient,
      tokenType: this.tokenType,
      baseUrl: baseUrl,
      getDPoPHeaders: useDPoP ? getDPoPHeadersForOrchestrator : undefined,
    });
    orchestrator.ssoExchange = () =>
      Promise.reject(
        new AuthError('UnsupportedOperation', ssoExchangeNotSupported)
      );
    this.auth = orchestrator;

    this.webAuth = new WebWebAuthProvider(this.client);
    this.credentialsManager = new WebCredentialsManager(this.client);
    this.mfa = new WebMfaClient(this.client.mfa, this.tokenType);
    this.myAccount = new WebMyAccountClient(
      this.client,
      options.domain,
      useDPoP
    );
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

  readonly passwordless: IPasswordlessClient = new WebPasswordlessClient();

  public async logout(options?: LogoutOptions): Promise<void> {
    // If a logout process has already started, do nothing.
    if (this.logoutInProgress) {
      return;
    }
    this.logoutInProgress = true;

    try {
      await this.client.logout(options);
    } catch (e: any) {
      // Reset the flag on error so a retry is possible.
      this.logoutInProgress = false;
      throw new AuthError(
        e.error ?? 'LogoutFailed',
        e.error_description ?? e.message,
        { json: e }
      );
    }
  }

  async getDPoPHeaders(
    params: DPoPHeadersParams
  ): Promise<Record<string, string>> {
    // For web platform, we need to get the access token and use the underlying
    // auth0-spa-js DPoP utilities to generate the headers
    const {
      url,
      method,
      accessToken,
      tokenType,
      nonce: providedNonce,
    } = params;

    // If DPoP is not enabled or token is not DPoP type, return bearer header
    if (tokenType !== 'DPoP') {
      return {
        Authorization: `Bearer ${accessToken}`,
      };
    }

    try {
      // Use the public DPoP methods from auth0-spa-js
      // These methods are available when useDpop is enabled
      const headers: Record<string, string> = {
        Authorization: `DPoP ${accessToken}`,
      };

      // Use provided nonce if available, otherwise get the current DPoP nonce
      // (may be undefined on first request)
      const nonce = providedNonce ?? (await this.client.getDpopNonce());

      // Generate DPoP proof using the client's public method
      const dpopProof = await this.client.generateDpopProof({
        url,
        method,
        nonce,
        accessToken,
      });

      if (dpopProof) {
        headers.DPoP = dpopProof;
      }

      return headers;
    } catch (e: any) {
      const authError = new AuthError(
        e.error ?? 'dpop_generation_failed',
        e.error_description ?? e.message ?? 'Failed to generate DPoP headers',
        { json: e }
      );
      throw new DPoPError(authError);
    }
  }

  /**
   * Performs a Custom Token Exchange using RFC 8693.
   * Exchanges an external identity provider token for Auth0 tokens.
   *
   * @param parameters The token exchange parameters.
   * @returns A promise that resolves with Auth0 credentials.
   */
  async customTokenExchange(
    parameters: CustomTokenExchangeParameters
  ): Promise<Credentials> {
    const { subjectToken, subjectTokenType, audience, scope, organization } =
      parameters;

    validateTokenTypeUri(subjectTokenType, 'subjectTokenType');
    const { actorToken, actorTokenType } = validateActorTokenParameters(
      parameters.actorToken,
      parameters.actorTokenType
    );

    try {
      // Apply default scope if not provided for consistency with native platforms
      const finalScope = scope ?? 'openid profile email';

      const response = await this.client.loginWithCustomTokenExchange({
        subject_token: subjectToken,
        subject_token_type: subjectTokenType,
        audience,
        scope: finalScope,
        organization,
        ...(actorToken !== undefined && { actor_token: actorToken }),
        ...(actorTokenType !== undefined && {
          actor_token_type: actorTokenType,
        }),
      });

      // Convert expiresIn (seconds from now) to expiresAt (UNIX timestamp)
      const expiresAt = Math.floor(Date.now() / 1000) + response.expires_in;

      return {
        accessToken: response.access_token,
        idToken: response.id_token,
        tokenType: (response.token_type as TokenType) ?? this.tokenType,
        expiresAt,
        scope: response.scope,
        refreshToken: response.refresh_token,
      };
    } catch (e: any) {
      throw new AuthError(
        e.error ?? 'custom_token_exchange_failed',
        e.error_description ?? e.message ?? 'Custom token exchange failed',
        { json: e }
      );
    }
  }

  async passkeySignupChallenge(
    parameters: PasskeySignupChallengeParameters
  ): Promise<PasskeyChallengeResponse> {
    try {
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

      // auth0-spa-js's PasskeySignupChallengeOptions type requires at
      // least one of email/phoneNumber/username, but which identifiers
      // are actually accepted depends on the database connection's
      // configuration (see Prerequisites in EXAMPLES.md) — the API
      // rejects an unsupported/missing combination server-side, so no
      // client-side check is duplicated here (matching native, which
      // also forwards these fields as-is).
      const challenge = await this.client.passkey.getSignupChallenge({
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
      } as Parameters<typeof this.client.passkey.getSignupChallenge>[0]);

      return {
        authSession: challenge.authSession,
        authParamsPublicKey: challenge.publicKey as unknown as Record<
          string,
          any
        >,
      };
    } catch (e: any) {
      if (e instanceof PasskeyError) throw e;
      // spa-js's PasskeyRegisterError sets `.code`; the OAuth2-style
      // GenericError family (thrown by the underlying token/discovery
      // calls) only sets `.error` — check both so no error is silently
      // downgraded to PASSKEY_UNKNOWN_ERROR.
      const code = e.code ?? e.error ?? 'passkey_signup_challenge_failed';
      const authError = new AuthError(
        code,
        e.message ??
          e.error_description ??
          'Failed to request passkey signup challenge',
        { code, json: e.cause ?? e }
      );
      throw new PasskeyError(authError);
    }
  }

  async passkeyLoginChallenge(
    parameters: PasskeyLoginChallengeParameters
  ): Promise<PasskeyChallengeResponse> {
    try {
      const { realm, organization } = parameters;
      const challenge = await this.client.passkey.getLoginChallenge({
        realm,
        organization,
      });

      return {
        authSession: challenge.authSession,
        authParamsPublicKey: challenge.publicKey as unknown as Record<
          string,
          any
        >,
      };
    } catch (e: any) {
      if (e instanceof PasskeyError) throw e;
      const code = e.code ?? e.error ?? 'passkey_login_challenge_failed';
      const authError = new AuthError(
        code,
        e.message ??
          e.error_description ??
          'Failed to request passkey login challenge',
        { code, json: e.cause ?? e }
      );
      throw new PasskeyError(authError);
    }
  }

  async getTokenByPasskey(
    parameters: GetTokenByPasskeyParameters
  ): Promise<Credentials> {
    try {
      const {
        authSession,
        authResponse,
        realm,
        audience,
        scope,
        organization,
      } = parameters;

      // Apply default scope if not provided, for consistency with native
      // platforms (which default to "openid profile email" when omitted).
      const finalScope = scope ?? 'openid profile email';

      // `authResponse` is the raw PublicKeyCredential from
      // navigator.credentials.create()/.get() on the primary web path.
      // getTokenWithPasskey() detects attestation vs assertion and
      // serializes it internally. A JSON string is also accepted for
      // parity with the native platforms' bridge contract.
      let parsedCredential: PasskeyCredentialResponse | undefined;
      if (typeof authResponse === 'string') {
        try {
          parsedCredential = JSON.parse(authResponse) as PasskeyCredentialResponse;
        } catch (parseError) {
          throw new PasskeyError(
            new AuthError(
              'InvalidParameter',
              'authResponse must be a valid JSON string or PublicKeyCredential.',
              { code: 'InvalidParameter' }
            )
          );
        }
      }

      const response =
        parsedCredential
          ? await this.client._requestTokenForPasskey({
              authSession,
              credential: parsedCredential,
              realm,
              audience,
              scope: finalScope,
              organization,
            })
          : await this.client.passkey.getTokenWithPasskey({
              authSession,
              credential: authResponse as PublicKeyCredential,
              realm,
              audience,
              scope: finalScope,
              organization,
            });

      const expiresAt = Math.floor(Date.now() / 1000) + response.expires_in;

      return {
        accessToken: response.access_token,
        idToken: response.id_token,
        tokenType: (response.token_type as TokenType) ?? this.tokenType,
        expiresAt,
        scope: response.scope,
        refreshToken: response.refresh_token,
      };
    } catch (e: any) {
      if (e instanceof PasskeyError) throw e;
      // The token-exchange step (_requestTokenForPasskey / _requestToken)
      // throws auth0-spa-js's GenericError family (invalid_grant,
      // mfa_required, missing_refresh_token, use_dpop_nonce, ...) or a
      // bare Error from ID token verification — none of these set `.code`,
      // only `.error` (OAuth2-style), so check both before falling back to
      // a generic code. See PasskeyErrorCodes for the resulting mapping.
      const code = e.code ?? e.error ?? 'passkey_exchange_failed';
      const authError = new AuthError(
        code,
        e.message ??
          e.error_description ??
          'Failed to exchange passkey credential for tokens',
        { code, json: e.cause ?? e }
      );
      throw new PasskeyError(authError);
    }
  }
}
