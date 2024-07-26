import {
  AndroidConfig,
  ConfigPlugin,
  createRunOncePlugin,
  ExportedConfigWithProps,
  InfoPlist,
  withAppDelegate,
  withInfoPlist,
  withAndroidManifest,
} from 'expo/config-plugins';
import { mergeContents } from './generateCode';

let APPLICATION_ID_SUFFIX = '.auth0';
let pkg: { name: string; version?: string } = {
  name: 'react-native-auth0',
};
try {
  pkg = require('react-native-auth0/package.json');
} catch {
  // empty catch block
}

export const withAndroidAuth0Manifest: ConfigPlugin<Auth0PluginConfig[]> = (
  config,
  auth0Configs
) => {
  return withAndroidManifest(config, async (config) => {
    const mainApplication = AndroidConfig.Manifest.getMainApplicationOrThrow(
      config.modResults
    );

    AndroidConfig.Manifest.ensureToolsAvailable(config.modResults);

    // Ensure RedirectActivity exists
    let redirectActivity = mainApplication.activity?.find(
      (activity) =>
        activity.$['android:name'] ===
        'com.auth0.android.provider.RedirectActivity'
    );

    if (!redirectActivity) {
      redirectActivity = {
        '$': {
          'android:name': 'com.auth0.android.provider.RedirectActivity',
          'tools:node': 'replace',
          'android:exported': 'true',
        },
        'intent-filter': [
          {
            action: [{ $: { 'android:name': 'android.intent.action.VIEW' } }],
            category: [
              { $: { 'android:name': 'android.intent.category.DEFAULT' } },
              { $: { 'android:name': 'android.intent.category.BROWSABLE' } },
            ],
            data: [],
          },
        ],
      };
      mainApplication.activity = mainApplication.activity || [];
      mainApplication.activity.push(redirectActivity);
    }

    redirectActivity['intent-filter'] = redirectActivity['intent-filter'] || [];
    const intentFilter = redirectActivity['intent-filter'][0] || {};
    intentFilter.data = intentFilter.data || [];

    // Add data elements for each auth0Config
    auth0Configs.forEach((config) => {
      const dataElement = {
        $: {
          'android:scheme': config.customScheme,
          'android:host': config.domain,
        },
      };
      intentFilter.data?.push(dataElement);
    });

    return config;
  });
};

export const addAuth0AppDelegateCode = (src: string): string => {
  let tempSrc = src;
  // Tests to see if the RCTLinkingManager has already been added
  if (
    !/\[RCTLinkingManager.*application:.*openURL:.*options:.*\]/.test(tempSrc)
  ) {
    tempSrc = mergeContents({
      src: tempSrc,
      newSrc: [
        '- (BOOL)application:(UIApplication *)app openURL:(NSURL *)url',
        '            options:(NSDictionary<UIApplicationOpenURLOptionsKey, id> *)options',
        '{',
        '  return [RCTLinkingManager application:app openURL:url options:options];',
        '}',
      ].join('\n'),
      tag: 'react-native-auth0-linking',
      anchor: /@end/,
      comment: '//',
      offset: 0,
    }).contents;
  }
  // Checks to see if RCTLinkingManager hasn't been imported
  if (!/RCTLinkingManager\.h/.test(tempSrc)) {
    tempSrc = mergeContents({
      src: tempSrc,
      newSrc: `#import <React/RCTLinkingManager.h>`,
      anchor: /#import <React\/RCTBridge\.h>/,
      offset: 1,
      tag: 'react-native-auth0-import',
      comment: '//',
    }).contents;
  }
  return tempSrc;
};

const withIOSAuth0AppDelegate: ConfigPlugin<Auth0PluginConfig[]> = (config) => {
  return withAppDelegate(config, (config) => {
    const src = config.modResults.contents;
    config.modResults.contents = addAuth0AppDelegateCode(src);
    return config;
  });
};

const withIOSAuth0InfoPList: ConfigPlugin<Auth0PluginConfig[]> = (
  config,
  props
) => {
  return withInfoPlist(config, (config) => {
    return addIOSAuth0ConfigInInfoPList(props, config);
  });
};

export const addIOSAuth0ConfigInInfoPList = (
  props: Auth0PluginConfig[],
  config: ExportedConfigWithProps<InfoPlist>
) => {
  let urlTypes = config.modResults.CFBundleURLTypes || [];
  let bundleIdentifier;
  if (config.ios?.bundleIdentifier) {
    bundleIdentifier = config.ios?.bundleIdentifier + APPLICATION_ID_SUFFIX;
  }
  props.forEach((prop) => {
    let auth0Scheme = prop.customScheme;
    if (
      urlTypes.some(({ CFBundleURLSchemes }) =>
        CFBundleURLSchemes.includes(auth0Scheme)
      )
    ) {
      return;
    }
    urlTypes.push({
      CFBundleURLName: 'auth0',
      CFBundleURLSchemes: [auth0Scheme],
    });
  });
  config.modResults.CFBundleURLTypes = urlTypes;
  return config;
};

type Auth0PluginConfig = {
  customScheme: string;
  domain: string;
};

const withAuth0: ConfigPlugin<[Auth0PluginConfig] | Auth0PluginConfig> = (
  config,
  props
) => {
  const auth0PluginConfigs = Array.isArray(props) ? props : [props];
  config = withAndroidAuth0Manifest(config, auth0PluginConfigs);
  config = withIOSAuth0AppDelegate(config, auth0PluginConfigs);
  config = withIOSAuth0InfoPList(config, auth0PluginConfigs);
  return config;
};

export default createRunOncePlugin(withAuth0, pkg.name, pkg.version);
