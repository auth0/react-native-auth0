import type { ICredentialsManager } from '../../../core/interfaces';
import type { Credentials } from '../../../types';
import type { INativeBridge } from '../bridge';

/**
 * A native platform-specific implementation of the ICredentialsManager.
 * It delegates all credential storage, retrieval, and management logic to the
 * underlying native bridge, which uses secure native storage.
 */
export class NativeCredentialsManager implements ICredentialsManager {
  constructor(private bridge: INativeBridge) {}

  saveCredentials(credentials: Credentials): Promise<void> {
    return this.bridge.saveCredentials(credentials);
  }

  getCredentials(
    scope?: string,
    minTtl?: number,
    parameters?: Record<string, any>,
    forceRefresh?: boolean
  ): Promise<Credentials> {
    return this.bridge.getCredentials(scope, minTtl, parameters, forceRefresh);
  }

  hasValidCredentials(minTtl?: number): Promise<boolean> {
    return this.bridge.hasValidCredentials(minTtl);
  }

  clearCredentials(): Promise<void> {
    return this.bridge.clearCredentials();
  }
}
