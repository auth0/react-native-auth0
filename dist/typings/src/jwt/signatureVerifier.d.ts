import { JwtPayload } from 'jwt-decode';
/**
 * Verifies that an ID token is signed with a supported algorithm (HS256 or RS256), and verifies the signature
 * if signed with RS256. Note that this function is specific to the internals of this SDK, and not supported for general use.
 * @param {String} idToken the ID token
 * @param {Object} options required to verify an ID token's signature
 * @param {String} [options.domain] the Auth0 domain of the token's issuer
 * @returns {Promise} A promise that resolves to the decoded payload of the ID token, or rejects if the verification fails.
 */
export declare const verifySignature: (
  idToken: string,
  options: {
    domain: string;
  }
) => Promise<JwtPayload>;
