import {ConfigPlugin} from '@expo/config-plugins';
export declare const addAuth0GradleValues: (
  src: string,
  auth0Domain?: string | undefined,
  auth0Scheme?: string | undefined,
) => string;
export declare const addAuth0AppDelegateCode: (src: string) => string;
declare type Auth0IOSConfig = {
  scheme?: string;
  disablePListMod?: boolean;
};
declare type Auth0AndroidConfig = {
  scheme?: string;
  domain?: string;
};
declare type Auth0PluginConfig = {
  ios?: Auth0IOSConfig;
  android?: Auth0AndroidConfig;
  scheme?: string;
  domain?: string;
};
declare const _default: ConfigPlugin<void | Auth0PluginConfig>;
export default _default;
