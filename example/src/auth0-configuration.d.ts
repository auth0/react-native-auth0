interface Auth0Configuration {
  domain: string;
  clientId: string;
  domainSecondScreen: string;
  clientIdSecondScreen: string;
}

declare const config: Auth0Configuration;
export default config;
