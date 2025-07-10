import type {
  ICredentialsManager,
  IAuthenticationProvider,
} from '../interfaces';
import type { Credentials } from '../../types';
import { AuthError, Credentials as CredentialsModel } from '../models';

/**
 * A minimal interface for a secure key-value storage provider.
 * This will be implemented by platform adapters (e.g., using Keychain).
 */
export interface ICredentialsStorage {
  save(key: string, value: string): Promise<void>;
  get(key: string): Promise<string | null>;
  remove(key: string): Promise<void>;
}

const STORAGE_KEY = 'auth0.credentials';

/**
 * Orchestrates the logic for managing credentials. It uses a storage provider
 * to persist credentials and an authentication provider to refresh them.
 */
export class CredentialsOrchestrator implements ICredentialsManager {
  private storage: ICredentialsStorage;
  private authProvider: IAuthenticationProvider;

  constructor(
    storageProvider: ICredentialsStorage,
    authProvider: IAuthenticationProvider
  ) {
    this.storage = storageProvider;
    this.authProvider = authProvider;
  }

  async saveCredentials(credentials: Credentials): Promise<void> {
    const data = JSON.stringify(credentials);
    await this.storage.save(STORAGE_KEY, data);
  }

  async getCredentials(
    scope?: string,
    minTtl: number = 0,
    _parameters?: Record<string, any>, // _parameters is currently unused but kept for interface compliance
    forceRefresh: boolean = false
  ): Promise<Credentials> {
    const savedData = await this.storage.get(STORAGE_KEY);
    if (!savedData) {
      throw new AuthError('NoCredentials', 'No credentials found in storage.', {
        code: 'no_credentials',
      });
    }

    const credentials = new CredentialsModel(JSON.parse(savedData));

    if (forceRefresh || credentials.isExpired(minTtl)) {
      if (!credentials.refreshToken) {
        throw new AuthError(
          'NoRefreshToken',
          'Cannot refresh credentials without a refresh token.',
          { code: 'no_refresh_token' }
        );
      }

      try {
        const newCredentials = await this.authProvider.refreshToken({
          refreshToken: credentials.refreshToken,
          scope,
        });
        await this.saveCredentials(newCredentials);
        return newCredentials;
      } catch (e) {
        // If refresh fails, clear the stale credentials to prevent getting stuck in a bad state.
        await this.clearCredentials();
        throw e;
      }
    }

    return credentials;
  }

  async hasValidCredentials(minTtl: number = 0): Promise<boolean> {
    try {
      const savedData = await this.storage.get(STORAGE_KEY);
      if (!savedData) return false;

      const credentials = new CredentialsModel(JSON.parse(savedData));
      // Check for expiration or if a refresh token exists for potential renewal
      return !credentials.isExpired(minTtl) || !!credentials.refreshToken;
    } catch {
      return false;
    }
  }

  async clearCredentials(): Promise<void> {
    await this.storage.remove(STORAGE_KEY);
  }
}
