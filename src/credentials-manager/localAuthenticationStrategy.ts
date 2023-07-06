/**
 * **Used for iOS only:** The evaluation policy to use when accessing the credentials. Defaults to LocalAuthenticationStrategy.deviceOwnerWithBiometrics.
 */
enum LocalAuthenticationStrategy {
  /**
   * User authentication with biometry.
   */
  deviceOwnerWithBiometrics = 1,
  /**
   * User authentication with biometry, Apple Watch, or the device passcode.
   */
  deviceOwner,
}

export default LocalAuthenticationStrategy;
