import { NativeModules, Platform } from 'react-native';

const { PasskeyModule } = NativeModules;

export const PasskeyModuleErrorCodes = {
  USER_CANCELLED: 'USER_CANCELLED',
} as const;

export async function createPasskey(
  options: Record<string, any>
): Promise<string> {
  if (Platform.OS === 'web') {
    throw new Error('Passkeys are not supported on web');
  }
  const requestJson = JSON.stringify(options);
  return PasskeyModule.createPasskey(requestJson);
}

export async function getPasskey(
  options: Record<string, any>
): Promise<string> {
  if (Platform.OS === 'web') {
    throw new Error('Passkeys are not supported on web');
  }
  const requestJson = JSON.stringify(options);
  return PasskeyModule.getPasskey(requestJson);
}
