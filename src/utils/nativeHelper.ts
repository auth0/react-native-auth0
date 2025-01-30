import LocalAuthenticationOptions from 'src/credentials-manager/localAuthenticationOptions';
import { Auth0Module } from 'src/internal-types';

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
