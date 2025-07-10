import { Platform } from 'react-native';

/**
 * Defines the possible runtime platforms that the library supports.
 */
export type RuntimePlatform = 'native' | 'web';

/**
 * A utility class to detect the current runtime platform.
 */
export class PlatformDetector {
  /**
   * Detects and returns the current runtime platform.
   *
   * @remarks
   * It checks for React Native's specific `Platform.OS` values first.
   * If that doesn't match, it falls back to checking for a browser `window` object.
   *
   * @returns The detected platform as a `RuntimePlatform` string.
   * @throws {Error} If the platform is not supported (e.g., a pure Node.js server environment).
   */
  static detect(): RuntimePlatform {
    // The 'react-native' import is aliased for web, but Platform.OS will be 'web'.
    // We check for 'android' and 'ios' specifically to identify the native environment.
    if (Platform.OS === 'android' || Platform.OS === 'ios') {
      return 'native';
    }

    // A fallback check for a browser environment, which is characteristic of React Native Web.
    if (typeof window !== 'undefined') {
      return 'web';
    }

    throw new Error(
      'Unsupported platform detected. This library is designed for React Native, React Native Web, or other environments where `Platform` or `window` is defined.'
    );
  }
}
