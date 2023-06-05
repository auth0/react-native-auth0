/*
Based on the work of Tom Wu
http://www-cs-students.stanford.edu/~tjw/jsbn/
http://www-cs-students.stanford.edu/~tjw/jsbn/LICENSE
*/

import {BigInteger} from 'jsbn';
import SHA256 from 'crypto-js/sha256';

const digestInfoHead: {[key: string]: string} = {
  sha256: '3031300d060960864801650304020105000420',
};

const digestAlgs: {[key: string]: any} = {
  sha256: SHA256,
};

class RSAVerifier {
  private n: BigInteger;
  private e = 0;

  constructor(modulus: string, exp: string) {
    if (modulus && modulus.length > 0 && exp && exp.length > 0) {
      this.n = new BigInteger(modulus, 16);
      this.e = parseInt(exp, 16);
    } else {
      throw new Error('Invalid key data');
    }
  }

  verify(msg: string, encodedSignature: string) {
    const decodedSignature = encodedSignature.replace(
      /[^0-9a-f]|[\s\n]]/gi,
      '',
    );

    const signature = new BigInteger(decodedSignature, 16);
    if (signature.bitLength() > this.n.bitLength()) {
      //Signature does not match with the key modulus.
      return false;
    }

    const decryptedSignature = signature.modPowInt(this.e, this.n);
    const digest = decryptedSignature.toString(16).replace(/^1f+00/, '');

    const digestInfo = getAlgorithmFromDigest(digest);
    if (digestInfo === null) {
      //Hashing algorithm is not found
      return false;
    }

    if (!digestAlgs.hasOwnProperty(digestInfo.alg)) {
      //Hashing algorithm is not supported
      return false;
    }

    const msgHash = digestAlgs[digestInfo.alg](msg).toString();
    return digestInfo.hash === msgHash;
  }
}
function getAlgorithmFromDigest(
  hDigestInfo: string,
): {alg: string; hash: string} | null {
  for (let algName in digestInfoHead) {
    const head = digestInfoHead[algName];
    const len = head.length;

    if (hDigestInfo.substring(0, len) === head) {
      return {
        alg: algName,
        hash: hDigestInfo.substring(len),
      };
    }
  }
  return null;
}

export default RSAVerifier;
