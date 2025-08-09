import type { ICredentialsManager } from '../../../core/interfaces';
import type { AuthError } from '../../../core/models';
import { CredentialsManagerError } from '../../../core/models';
import type { Credentials } from '../../../types';
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

  hasValidCredentials(minTtl?: number): Promise<boolean> {
    return this.handleError(this.bridge.hasValidCredentials(minTtl));
  }

  clearCredentials(): Promise<void> {
    return this.handleError(this.bridge.clearCredentials());
  }
}
