declare type TokenVerificationOptions = {
  domain: string;
  clientId: string;
  nonce?: string;
  maxAge?: number;
  scope?: string;
  leeway?: number;
  orgId?: string;
  _clock?: Date;
};
/**
 * Verifies an ID token according to the OIDC specification. Note that this function is specific to the internals of this SDK,
 * and is not supported for general use.
 * @param {String} idToken the string token to verify
 * @param {Object}options the options required to run this verification
 * @returns {Promise} A promise that resolves if the verification is successful, or will reject the promise if validation fails
 */
export declare const verifyToken: (
  idToken: string,
  options: TokenVerificationOptions
) => Promise<void>;
export {};
