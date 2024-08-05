/**
 * **Used for Android only:** The level of local authentication required to access the credentials. Defaults to LocalAuthenticationLevel.strong.
 */

enum LocalAuthenticationLevel {
  /**
   * Any biometric (e.g. fingerprint, iris, or face) on the device that meets or exceeds the requirements for Class 3 (formerly Strong), as defined by the Android CDD.
   */
  strong = 0,
  /**
   * Any biometric (e.g. fingerprint, iris, or face) on the device that meets or exceeds the requirements for Class 2 (formerly Weak), as defined by the Android CDD.
   */
  weak,
  /**
   * The non-biometric credential used to secure the device (i. e. PIN, pattern, or password).
   */
  deviceCredential,
}

export default LocalAuthenticationLevel;
