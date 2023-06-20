import { Auth0Module } from 'src/internal-types';

//private
export async function _ensureNativeModuleIsInitialized(
  nativeModule: Auth0Module,
  clientId: string,
  domain: string
) {
  const hasValid = await nativeModule.hasValidAuth0Instance();
  if (!hasValid) {
    await nativeModule.initializeAuth0(clientId, domain);
  }
}
