import type { Spec } from '../specs/NativeA0Auth0';
import type LocalAuthenticationOptions from '../credentials-manager/localAuthenticationOptions';

//private
export async function _ensureNativeModuleIsInitializedWithConfiguration(
  nativeModule: Spec,
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
