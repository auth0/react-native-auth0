/**
 * Borrowed from IDToken-verifier package
 * https://github.com/auth0/idtoken-verifier/blob/master/src/helpers/base64.js
 */
import base64 from 'base64-js';

export function padding(str) {
  const paddingLength = 4;
  const mod = str.length % paddingLength;
  const pad = paddingLength - mod;

  if (mod === 0) {
    return str;
  }

  return str + new Array(1 + pad).join('=');
}

function byteArrayToHex(raw) {
  let HEX = '';

  for (let i = 0; i < raw.length; i++) {
    const _hex = raw[i].toString(16);
    HEX += _hex.length === 2 ? _hex : '0' + _hex;
  }

  return HEX;
}

export function decodeToHEX(str) {
  return byteArrayToHex(base64.toByteArray(padding(str)));
}
