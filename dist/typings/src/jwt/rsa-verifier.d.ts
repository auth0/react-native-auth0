declare class RSAVerifier {
  private n;
  private e;
  constructor(modulus: string, exp: string);
  verify(msg: string, encodedSignature: string): boolean;
}
export default RSAVerifier;
