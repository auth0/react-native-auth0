import {
  ConfigPlugin,
  ExportedConfigWithProps,
  InfoPlist,
} from '@expo/config-plugins';
import { GradleProjectFile } from '@expo/config-plugins/build/android/Paths';
export declare const addAuth0GradleValues: (
  src: string,
  auth0Domain: string,
  auth0Scheme?: string
) => string;
export declare const addAndroidAuth0Gradle: (
  props: Auth0PluginConfig,
  config: ExportedConfigWithProps<GradleProjectFile>
) => ExportedConfigWithProps<GradleProjectFile>;
export declare const addAuth0AppDelegateCode: (src: string) => string;
export declare const addIOSAuth0ConfigInInfoPList: (
  props: Auth0PluginConfig,
  config: ExportedConfigWithProps<InfoPlist>
) => ExportedConfigWithProps<InfoPlist>;
declare type Auth0PluginConfig = {
  customScheme?: string;
  domain?: string;
};
declare const _default: ConfigPlugin<Auth0PluginConfig>;
export default _default;
