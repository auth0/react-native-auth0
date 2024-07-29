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

export const addAndroidAuth0Manifest = (
  auth0Configs: Auth0PluginConfig[],
  manifest: ExportedConfigWithProps<AndroidConfig.Manifest.AndroidManifest>,
  applicationId?: string
) => {
  const intentFilterContent = [
    {
      action: [{ $: { 'android:name': 'android.intent.action.VIEW' } }],
      category: [
        { $: { 'android:name': 'android.intent.category.DEFAULT' } },
        { $: { 'android:name': 'android.intent.category.BROWSABLE' } },
      ],
      data: [],
    },
  ];

  const mainApplication = AndroidConfig.Manifest.getMainApplicationOrThrow(
    manifest.modResults
  );

  AndroidConfig.Manifest.ensureToolsAvailable(manifest.modResults);

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
      'intent-filter': intentFilterContent,
    };
    mainApplication.activity = mainApplication.activity || [];
    mainApplication.activity.push(redirectActivity);
  }

  redirectActivity['intent-filter'] =
    redirectActivity['intent-filter'] || intentFilterContent;
  const intentFilter = redirectActivity['intent-filter'][0] || {};
  intentFilter.data = intentFilter.data || [];

  // Add data elements for each auth0Config
  auth0Configs.forEach((config) => {
    let auth0Scheme =
      config.customScheme ??
      (applicationId != null
        ? applicationId + APPLICATION_ID_SUFFIX
        : undefined) ??
      (() => {
        throw new Error(
          `No auth0 scheme specified or package found in expo config for domain ${config}`
        );
      })();
    const dataElement = {
      $: {
        'android:scheme': auth0Scheme,
        'android:host': config.domain,
      },
    };
    intentFilter.data?.push(dataElement);
  });
  return manifest;
};

const withAndroidAuth0Manifest: ConfigPlugin<Auth0PluginConfig[]> = (
  config,
  auth0Configs
) => {
  let applicationId = config.android?.package;
  return withAndroidManifest(config, (manifest) => {
    return addAndroidAuth0Manifest(auth0Configs, manifest, applicationId);
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
  props
    .filter((prop) => prop.customScheme != null)
    .forEach((prop) => {
      let auth0Scheme = prop.customScheme ?? '';
      if (
        urlTypes.some(({ CFBundleURLSchemes }) =>
          CFBundleURLSchemes.includes(auth0Scheme)
        )
      ) {
        return;
      }
      const existingAuth0URLType = urlTypes.find(
        (urlType) => urlType.CFBundleURLName === 'auth0'
      );

      if (existingAuth0URLType) {
        // Add the scheme to the existing CFBundleURLSchemes array
        if (!existingAuth0URLType.CFBundleURLSchemes.includes(auth0Scheme)) {
          existingAuth0URLType.CFBundleURLSchemes.push(auth0Scheme);
        }
      } else {
        // Add a new object
        urlTypes.push({
          CFBundleURLName: 'auth0',
          CFBundleURLSchemes: [auth0Scheme],
        });
      }
    });
  config.modResults.CFBundleURLTypes = urlTypes;
  return config;
};

type Auth0PluginConfig = {
  customScheme?: string;
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
