import type { LocalAuthenticationOptions } from '../credentials-manager/localAuthenticationOptions';
import type { Auth0Module } from '../internal-types';

//private
export async function _ensureNativeModuleIsInitializedWithConfiguration(
  nativeModule: Auth0Module,
  clientId: string,
  domain: string,
  localAuthenticationOptions?: LocalAuthenticationOptions
) {
  const hasValid = await nativeModule.hasValidAuth0InstanceWithConfiguration(
    clientId,
    domain
  );
  if (!hasValid) {
    await nativeModule.initializeAuth0WithConfiguration(
      clientId,
      domain,
      localAuthenticationOptions
    );
  }
}
