import { Platform } from 'react-native';

/**
 * Check if the current platform is web
 * @returns {boolean} true if the platform is web, false otherwise
 */
export const isWeb: boolean = Platform.OS === 'web';

/**
 * Check if the current platform is iOS
 * @returns {boolean} true if the platform is iOS, false otherwise
 */
export const isIOS: boolean = Platform.OS === 'ios';

/**
 * Check if the current platform is Android
 * @returns {boolean} true if the platform is Android, false otherwise
 */
export const isAndroid: boolean = Platform.OS === 'android';
