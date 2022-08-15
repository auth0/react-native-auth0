import CredentialsManager from '../index';
import Auth from '../../auth';

describe('credentials manager tests', () => {
  const auth = new Auth({baseUrl: 'https://auth0.com', clientId: 'abc123'});
  const credentialsManager = new CredentialsManager(auth);

  const validToken = {
    idToken: '1234',
    accessToken: '1234',
    tokenType: 'Bearer',
    expiresIn: 86000,
  };

  describe('test saving credentials', () => {
    it('throws when access token is empty', async () => {
      const testToken = Object.assign({}, validToken);
      testToken.idToken = undefined;
      await expect(
        credentialsManager.saveCredentials(testToken),
      ).rejects.toThrow();
    });

    it('throws when token type is empty', async () => {
      const testToken = Object.assign({}, validToken);
      testToken.tokenType = undefined;
      await expect(
        credentialsManager.saveCredentials(testToken),
      ).rejects.toThrow();
    });

    it('throws when access type is empty', async () => {
      const testToken = Object.assign({}, validToken);
      testToken.accessToken = undefined;
      await expect(
        credentialsManager.saveCredentials(testToken),
      ).rejects.toThrow();
    });

    it('throws when expiresIn type is empty', async () => {
      const testToken = Object.assign({}, validToken);
      testToken.expiresIn = undefined;
      await expect(
        credentialsManager.saveCredentials(testToken),
      ).rejects.toThrow();
    });

    it('throws when expiresIn type is zero', async () => {
      const testToken = Object.assign({}, validToken);
      testToken.expiresIn = 0;
      await expect(
        credentialsManager.saveCredentials(testToken),
      ).rejects.toThrow();
    });
  });
});
