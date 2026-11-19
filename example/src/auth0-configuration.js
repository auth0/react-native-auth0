const config = {
  clientId: 'your-client-id',
  domain: 'your-domain',
  clientIdSecondScreen: 'your-client-id',
  domainSecondScreen: 'your-domain',
  // DPoP is opt-in in v6. Set to true to try getDPoPHeaders() in Advanced Tokens,
  // then log in again so the issued access token is DPoP-bound.
  useDPoP: false,
};

export default config;
