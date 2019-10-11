import AuthError from '../auth/authError';
import {verifySignature} from './signatureVerifier';

// default clock skew, in seconds
const DEFAULT_LEEWAY = 60;

/**
 * Verifies an ID token according to the OIDC spec
 * @param {Object} credentials the credentials obtained from the token exchange
 * @param {Object} clientInfo the information about the client required to validate the ID token
 * @returns {Promise} A promise containing the credentials, or will reject the promise if validation fails
 */
export const verifyToken = (credentials, clientInfo) => {
  if (!tokenValidationRequired(credentials, clientInfo)) {
    return Promise.resolve(credentials);
  }

  if (!credentials.idToken) {
    return Promise.reject(
      idTokenError({
        error: 'missing_id_token',
        desc: 'ID token is required but missing',
      }),
    );
  }

  const sigOptions = {
    idToken: credentials.idToken,
    domain: clientInfo.domain,
  };

  return verifySignature(sigOptions)
    .then(payload => validateClaims(payload, clientInfo))
    .then(() => Promise.resolve(credentials));
};

const tokenValidationRequired = (credentials, clientInfo) => {
  // If client did not specify scope of "openid", we do not expect an ID token thus no validation is needed
  if (clientInfo.scope && typeof clientInfo.scope === 'string') {
    const scopes = clientInfo.scope.split(/(\s+)/);
    if (scopes.includes('openid')) {
      return true;
    }
  }
  return false;
};

const validateClaims = (payload, opts) => {
  // Issuer
  if (typeof payload.iss !== 'string') {
    return Promise.reject(
      idTokenError({
        error: 'missing_issuer_claim',
        desc: 'Issuer (iss) claim must be a string present in the ID token',
      }),
    );
  }

  if (payload.iss !== 'https://' + opts.domain + '/') {
    return Promise.reject(
      idTokenError({
        error: 'invalid_issuer_claim',
        desc: `Issuer (iss) claim mismatch in the ID token; expected "https://${opts.domain}/", found "${payload.iss}"`,
      }),
    );
  }

  // Subject
  if (typeof payload.sub !== 'string') {
    return Promise.reject(
      idTokenError({
        error: 'missing_subject_claim',
        desc: 'Subject (sub) claim must be a string present in the ID token',
      }),
    );
  }

  // Audience
  if (!(typeof payload.aud === 'string' || Array.isArray(payload.aud))) {
    return Promise.reject(
      idTokenError({
        error: 'missing_audience_claim',
        desc:
          'Audience (aud) claim must be a string or array of strings present in the ID token',
      }),
    );
  }

  if (Array.isArray(payload.aud) && !payload.aud.includes(opts.clientId)) {
    return Promise.reject(
      idTokenError({
        error: 'invalid_audience_claim',
        desc: `Audience (aud) claim mismatch in the ID token; expected "${
          opts.clientId
        }" but was not one of "${payload.aud.join(', ')}"`,
      }),
    );
  } else if (typeof payload.aud === 'string' && payload.aud !== opts.clientId) {
    return Promise.reject(
      idTokenError({
        error: 'invalid_audience_claim',
        desc: `Audience (aud) claim mismatch in the ID token; expected "${opts.clientId}" but found "${payload.aud}"`,
      }),
    );
  }

  //--Time validation (epoch)--
  const now = opts._clock
    ? getEpochTimeInSeconds(opts._clock)
    : getEpochTimeInSeconds(new Date());
  const leeway = typeof opts.leeway === 'number' ? opts.leeway : DEFAULT_LEEWAY;

  //Expires at
  if (typeof payload.exp !== 'number') {
    return Promise.reject(
      idTokenError({
        error: 'missing_expires_at_claim',
        desc:
          'Expiration Time (exp) claim must be a number present in the ID token',
      }),
    );
  }

  const expTime = payload.exp + leeway;

  if (now > expTime) {
    return Promise.reject(
      idTokenError({
        error: 'invalid_expires_at_claim',
        desc: `Expiration Time (exp) claim error in the ID token; current time "${now}" is after expiration time "${expTime}"`,
      }),
    );
  }

  //Issued at
  if (typeof payload.iat !== 'number') {
    return Promise.reject(
      idTokenError({
        error: 'missing_issued_at_claim',
        desc: 'Issued At (iat) claim must be a number present in the ID token',
      }),
    );
  }

  const iatTime = payload.iat - leeway;

  if (now < iatTime) {
    return Promise.reject(
      idTokenError({
        error: 'invalid_issued_at_claim',
        desc: `Issued At (iat) claim error in the ID token; current time "${now}" is before issued at time "${iatTime}"`,
      }),
    );
  }

  //Nonce
  if (opts.nonce) {
    if (typeof payload.nonce !== 'string') {
      return Promise.reject(
        idTokenError({
          error: 'missing_nonce_claim',
          desc: 'Nonce (nonce) claim must be a string present in the ID token',
        }),
      );
    }
    if (payload.nonce !== opts.nonce) {
      return Promise.reject(
        idTokenError({
          error: 'invalid_nonce_claim',
          desc: `Nonce (nonce) claim mismatch in the ID token; expected "${opts.nonce}", found "${payload.nonce}"`,
        }),
      );
    }
  }

  //Authorized party
  if (Array.isArray(payload.aud) && payload.aud.length > 1) {
    if (typeof payload.azp !== 'string') {
      return Promise.reject(
        idTokenError({
          error: 'missing_authorized_party_claim',
          desc:
            'Authorized Party (azp) claim must be a string present in the ID token when Audience (aud) claim has multiple values',
        }),
      );
    }

    if (payload.azp !== opts.clientId) {
      return Promise.reject(
        idTokenError({
          error: 'invalid_authorized_party_claim',
          desc: `Authorized Party (azp) claim mismatch in the ID token; expected "${opts.clientId}", found "${payload.azp}"`,
        }),
      );
    }
  }

  //Authentication time
  if (typeof opts.maxAge === 'number') {
    if (typeof payload.auth_time !== 'number') {
      return Promise.reject(
        idTokenError({
          error: 'missing_authorization_time_claim',
          desc:
            'Authentication Time (auth_time) claim must be a number present in the ID token when Max Age (max_age) is specified',
        }),
      );
    }

    const authValidUntil = payload.auth_time + opts.maxAge + leeway;

    if (now > authValidUntil) {
      return Promise.reject(
        idTokenError({
          error: 'invalid_authorization_time_claim',
          desc: `Authentication Time (auth_time) claim in the ID token indicates that too much time has passed since the last end-user authentication. Current time "${now}" is after last auth time "${authValidUntil}"`,
        }),
      );
    }
  }

  return Promise.resolve();
};

const getEpochTimeInSeconds = date => {
  return Math.round(date.getTime() / 1000);
};

const idTokenError = ({
  error = 'verification_error',
  desc = 'Error verifying ID token',
} = {}) => {
  return new AuthError({
    json: {
      error: `a0.idtoken.${error}`,
      error_description: desc,
    },
    status: 0,
  });
};
