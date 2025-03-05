const A0Auth0 = {
  hasValidAuth0InstanceWithConfiguration: jest.fn(() => Promise.resolve(true)),
  saveCredentials: jest.fn(() => Promise.resolve(true)),
  getCredentials: jest.fn(() => Promise.resolve()),
  hasValidCredentials: jest.fn(() => Promise.resolve(false)),
  clearCredentials: jest.fn(() => Promise.resolve(true)),
  enableLocalAuthentication: jest.fn(() => Promise.resolve()),
};

export default A0Auth0;
