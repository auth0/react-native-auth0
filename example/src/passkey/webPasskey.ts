// Minimal WebAuthn ceremony for the web example's My Account passkey flow.
// The My Account API returns `authParamsPublicKey` with base64url-encoded
// binary fields (challenge, user.id, excludeCredentials[].id). The browser's
// `navigator.credentials.create` needs those as ArrayBuffers, and the server
// expects the resulting credential serialized back to base64url JSON.

function base64UrlToBuffer(base64Url: string): ArrayBuffer {
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(
    base64.length + ((4 - (base64.length % 4)) % 4),
    '='
  );
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

function bufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Runs the WebAuthn registration ceremony in the browser and returns the
 * credential serialized as a JSON string, matching the shape
 * `myAccount.enrollPasskey` expects for `authResponse`.
 */
export async function createWebPasskey(
  authParamsPublicKey: Record<string, any>
): Promise<string> {
  if (
    typeof navigator === 'undefined' ||
    !navigator.credentials ||
    !window.PublicKeyCredential
  ) {
    throw new Error('WebAuthn is not available in this browser.');
  }

  // The server sends rp/pubKeyCredParams verbatim; we only rehydrate the
  // base64url binary fields into ArrayBuffers for the browser API.
  const publicKey = {
    ...authParamsPublicKey,
    challenge: base64UrlToBuffer(authParamsPublicKey.challenge),
    user: {
      ...authParamsPublicKey.user,
      id: base64UrlToBuffer(authParamsPublicKey.user.id),
    },
    excludeCredentials: (authParamsPublicKey.excludeCredentials ?? []).map(
      (cred: any) => ({
        ...cred,
        id: base64UrlToBuffer(cred.id),
      })
    ),
  } as PublicKeyCredentialCreationOptions;

  const credential = (await navigator.credentials.create({
    publicKey,
  })) as PublicKeyCredential | null;

  if (!credential) {
    throw new Error('Passkey creation returned no credential.');
  }

  const response = credential.response as AuthenticatorAttestationResponse;

  return JSON.stringify({
    id: credential.id,
    rawId: bufferToBase64Url(credential.rawId),
    type: credential.type,
    authenticatorAttachment: credential.authenticatorAttachment ?? undefined,
    response: {
      clientDataJSON: bufferToBase64Url(response.clientDataJSON),
      attestationObject: bufferToBase64Url(response.attestationObject),
      transports:
        typeof response.getTransports === 'function'
          ? response.getTransports()
          : undefined,
    },
  });
}
