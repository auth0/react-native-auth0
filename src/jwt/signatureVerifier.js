import AuthError from '../auth/authError';
import {KEYUTIL, KJUR} from 'jsrsasign';
const jwtDecoder = require('jwt-decode');

const ALLOWED_ALGORITHMS = ['RS256', 'HS256'];

/**
 * Verifies that an ID token is signed with a supported algorithm (HS256 or RS256), and verifies the signature
 * if signed with RS256. Note that this function is specific to the internals of this SDK, and not supported for general use.
 * @param {String} idToken the ID token
 * @param {Object} options required to verify an ID token's signature
 * @param {String} [options.domain] the Auth0 domain of the token's issuer
 * @returns {Promise} A promise that resolves to the decoded payload of the ID token, or rejects if the verification fails.
 */
export const verifySignature = (idToken, options) => {
  let header, payload;

  try {
    header = jwtDecoder(idToken, {header: true});
    payload = jwtDecoder(idToken);
  } catch (err) {
    return Promise.reject(
      idTokenError({
        error: 'token_decoding_error',
        desc: 'ID token could not be decoded',
      }),
    );
  }

  const alg = header.alg;

  if (!ALLOWED_ALGORITHMS.includes(alg)) {
    return Promise.reject(
      idTokenError({
        error: 'invalid_algorithm',
        desc: `Signature algorithm of "${alg}" is not supported. Expected "RS256" or "HS256".`,
      }),
    );
  }

  // HS256 tokens require private key, which cannot be stored securely in public clients.
  // Since the ID token exchange is done via CODE with PKCE flow, we can skip signature verification in this case.
  if (alg === 'HS256') {
    return Promise.resolve(payload);
  }

  return getJwk(options.domain, header.kid).then(jwk => {
    const pubKey = KEYUTIL.getKey(jwk);
    const signatureValid = KJUR.jws.JWS.verify(idToken, pubKey, ['RS256']);

    if (signatureValid) {
      return Promise.resolve(payload);
    }

    return Promise.reject(
      idTokenError({
        error: 'invalid_signature',
        desc: 'Invalid token signature',
      }),
    );
  });
};

const getJwk = (domain, kid) => {
  return getJwksUri(domain)
    .then(uri => fetchJson(uri))
    .then(jwk => {
      const keys = jwk.keys;
      const key = keys
        .filter(
          k => k.use === 'sig' && k.kty === 'RSA' && k.kid && (k.n && k.e),
        )
        .find(k => k.kid === kid);
      return Promise.resolve(key);
    })
    .catch(err => {
      return Promise.reject(
        idTokenError({
          error: 'key_retrieval_error',
          desc: 'Unable to retrieve public keyset needed to verify token',
        }),
      );
    });
};

const getJwksUri = domain => {
  return fetch(`https://${domain}/.well-known/openid-configuration`)
    .then(resp => resp.json())
    .then(openIdConfig => openIdConfig.jwks_uri);
};

const fetchJson = uri => {
  return fetch(uri).then(resp => resp.json());
};

const idTokenError = err => {
  return new AuthError({
    json: {
      error: `a0.idtoken.${err.error}`,
      error_description: err.desc,
    },
    status: 0,
  });
};
