// Mock implementation of the A0Auth0 native module for testing
const A0Auth0 = {
  hasValidAuth0InstanceWithConfiguration: jest.fn(() => Promise.resolve(true)),
  initializeAuth0WithConfiguration: jest.fn(() => Promise.resolve()),
  saveCredentials: jest.fn(() => Promise.resolve(true)),
  getCredentials: jest.fn(() => Promise.resolve()),
  hasValidCredentials: jest.fn(() => Promise.resolve(false)),
  clearCredentials: jest.fn(() => Promise.resolve(true)),
  enableLocalAuthentication: jest.fn(() => Promise.resolve()),
  getBundleIdentifier: jest.fn(() => Promise.resolve('com.my.app')),
  webAuth: jest.fn(() =>
    Promise.resolve({
      id_token: 'id_token',
      access_token: 'access_token',
      token_type: 'Bearer',
      expires_in: 86400,
      refresh_token: 'refresh_token',
    })
  ),
  webAuthLogout: jest.fn(() => Promise.resolve()),
  cancelWebAuth: jest.fn(() => Promise.resolve()),
  resumeWebAuth: jest.fn(() => Promise.resolve()),
};

export default A0Auth0;
