interface Auth0Configuration {
  domain: string;
  clientId: string;
  domainSecondScreen: string;
  clientIdSecondScreen: string;
  useDPoP?: boolean;
}

declare const config: Auth0Configuration;
export default config;
