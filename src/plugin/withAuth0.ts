import {
  AndroidConfig,
  createRunOncePlugin,
  withAppDelegate,
  withInfoPlist,
  withAndroidManifest,
} from 'expo/config-plugins';
import type {
  ConfigPlugin,
  ExportedConfigWithProps,
  InfoPlist,
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
  if (auth0Configs.length === 0) {
    throw new Error(`No auth0 domain specified in expo config`);
  }

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
    if (config.domain == null) {
      throw new Error(`No auth0 domain specified in expo config`);
    }
    if (config.customScheme == null && applicationId == null) {
      throw new Error(
        `No auth0 scheme specified or package found in expo config`
      );
    }
    let auth0Scheme =
      config.customScheme ?? applicationId + APPLICATION_ID_SUFFIX;

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

export const addAuth0AppDelegateCode = (
  src: string,
  language: string
): string => {
  let tempSrc = src;

  // Check if this is a Swift app delegate file by looking for Swift syntax patterns
  // rather than relying on import statements that may change
  const isSwift = language === 'swift';

  if (!isSwift) {
    // Throw error for non-Swift files, since we're only supporting Swift app delegates (RN 78+)
    throw new Error(
      'This plugin only supports expo 53 or greater. If you are using older version 4.x'
    );
  }

  // Swift handling for Expo 53+
  // Add URL handling method if it doesn't exist
  if (!src.includes('RCTLinkingManager.application')) {
    tempSrc = mergeContents({
      src: tempSrc,
      newSrc: [
        '  // Handle URL schemes for Auth0 authentication',
        '  override func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey : Any] = [:]) -> Bool {',
        '    return RCTLinkingManager.application(app, open: url, options: options)',
        '  }',
      ].join('\n'),
      tag: 'react-native-auth0-linking-swift',
      anchor: /override func sourceURL\(for bridge: RCTBridge\)/,
      comment: '//',
      offset: -1,
    }).contents;
  }

  // In expo 53+ by default RCTLinkingManager is available

  return tempSrc;
};

const withIOSAuth0AppDelegate: ConfigPlugin<Auth0PluginConfig[]> = (config) => {
  return withAppDelegate(config, (config) => {
    const src = config.modResults.contents;
    const language = config.modResults.language;
    config.modResults.contents = addAuth0AppDelegateCode(src, language);
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
  let customSchemes = props
    .filter((prop) => prop.customScheme != null)
    .map((prop) => prop.customScheme as string);

  let bundleIdentifier;
  if (config.ios?.bundleIdentifier) {
    bundleIdentifier = config.ios?.bundleIdentifier + APPLICATION_ID_SUFFIX;
  }

  if (customSchemes.length === 0) {
    if (bundleIdentifier == null) {
      throw Error(
        'No auth0 scheme specified or bundle identifier found in expo config'
      );
    } else {
      customSchemes = [bundleIdentifier];
    }
  }

  let urlTypes = config.modResults.CFBundleURLTypes || [];
  customSchemes.forEach((scheme) => {
    if (
      urlTypes.some(({ CFBundleURLSchemes }) =>
        CFBundleURLSchemes.includes(scheme)
      )
    ) {
      return;
    }
    const existingAuth0URLType = urlTypes.find(
      (urlType) => urlType.CFBundleURLName === 'auth0'
    );

    if (existingAuth0URLType) {
      // Add the scheme to the existing CFBundleURLSchemes array
      existingAuth0URLType.CFBundleURLSchemes.push(scheme);
    } else {
      // Add a new object
      urlTypes.push({
        CFBundleURLName: 'auth0',
        CFBundleURLSchemes: [scheme],
      });
    }
  });
  config.modResults.CFBundleURLTypes = urlTypes;
  return config;
};

type Auth0PluginConfig = {
  customScheme?: string;
  domain?: string;
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
