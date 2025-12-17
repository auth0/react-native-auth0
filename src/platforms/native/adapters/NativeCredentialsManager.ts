import type { ICredentialsManager } from '../../../core/interfaces';
import { ApiCredentials, AuthError } from '../../../core/models';
import { CredentialsManagerError } from '../../../core/models';
import type {
  ApiCredentials as IApiCredentials,
  Credentials,
  SessionTransferCredentials,
} from '../../../types';
import type { INativeBridge } from '../bridge';

/**
 * A native platform-specific implementation of the ICredentialsManager.
 * It delegates all credential storage, retrieval, and management logic to the
 * underlying native bridge, which uses secure native storage.
 */
export class NativeCredentialsManager implements ICredentialsManager {
  constructor(private bridge: INativeBridge) {}

  private async handleError<T>(promise: Promise<T>): Promise<T> {
    try {
      return await promise;
    } catch (e) {
      // Assume the bridge only throws AuthError.
      throw new CredentialsManagerError(e as AuthError);
    }
  }

  saveCredentials(credentials: Credentials): Promise<void> {
    return this.handleError(this.bridge.saveCredentials(credentials));
  }

  getCredentials(
    scope?: string,
    minTtl?: number,
    parameters?: Record<string, any>,
    forceRefresh?: boolean
  ): Promise<Credentials> {
    return this.handleError(
      this.bridge.getCredentials(scope, minTtl, parameters, forceRefresh)
    );
  }

  async clearCredentials(audience?: string, scope?: string): Promise<void> {
    return this.handleError(this.bridge.clearCredentials(audience, scope));
  }

  async hasValidCredentials(minTtl?: number): Promise<boolean> {
    return this.handleError(this.bridge.hasValidCredentials(minTtl));
  }

  async getApiCredentials(
    audience: string,
    scope?: string,
    minTtl?: number,
    parameters?: Record<string, any>
  ): Promise<ApiCredentials> {
    const nativeCredentials = await this.handleError(
      this.bridge.getApiCredentials(audience, scope, minTtl ?? 0, parameters)
    );
    // Convert plain object from native to class instance
    return new ApiCredentials(nativeCredentials as IApiCredentials);
  }

  async clearApiCredentials(audience: string, scope?: string): Promise<void> {
    return this.handleError(this.bridge.clearApiCredentials(audience, scope));
  }

  getSSOCredentials(
    parameters?: Record<string, any>,
    headers?: Record<string, string>
  ): Promise<SessionTransferCredentials> {
    return this.handleError(this.bridge.getSSOCredentials(parameters, headers));
  }
}
