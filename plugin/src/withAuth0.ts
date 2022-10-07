import {
  ConfigPlugin,
  createRunOncePlugin,
  ExportedConfigWithProps,
  InfoPlist,
  withAppBuildGradle,
  withAppDelegate,
  withInfoPlist,
} from '@expo/config-plugins';
import {GradleProjectFile} from '@expo/config-plugins/build/android/Paths';
import {mergeContents} from '@expo/config-plugins/build/utils/generateCode';

let pkg: {name: string; version?: string} = {
  name: 'react-native-auth0',
};
try {
  pkg = require('react-native-auth0/package.json');
} catch {
  // empty catch block
}

export const addAuth0GradleValues = (
  src: string,
  auth0Domain: string,
  auth0Scheme = 'applicationId',
): string => {
  return mergeContents({
    tag: 'react-native-auth0-manifest-placeholder',
    src,
    newSrc: `manifestPlaceholders = [auth0Domain: "${auth0Domain}", auth0Scheme: "${auth0Scheme}"]`,
    anchor: /defaultConfig {/,
    offset: 1,
    comment: '//',
  }).contents;
};

const withAndroidAuth0Gradle: ConfigPlugin<Auth0PluginConfig> = (
  config,
  props,
) => {
  return withAppBuildGradle(config, config => {
    return addAndroidAuth0Gradle(props, config);
  });
};

export const addAndroidAuth0Gradle = (
  props: Auth0PluginConfig,
  config: ExportedConfigWithProps<GradleProjectFile>,
) => {
  if (config.modResults.language === 'groovy') {
    if (!props?.domain) {
      throw Error('No auth0 domain specified in expo config');
    }
    const auth0Domain = props.domain;
    let auth0Scheme =
      props.customScheme ??
      config.android?.package ??
      (() => {
        throw new Error(
          'No auth0 scheme specified or package found in expo config',
        );
      })();
    config.modResults.contents = addAuth0GradleValues(
      config.modResults.contents,
      auth0Domain,
      auth0Scheme,
    );
    return config;
  } else {
    throw new Error(
      'Cannot add auth0 build.gradle modifications because the build.gradle is not groovy',
    );
  }
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

const withIOSAuth0AppDelegate: ConfigPlugin<Auth0PluginConfig> = config => {
  return withAppDelegate(config, config => {
    const src = config.modResults.contents;
    config.modResults.contents = addAuth0AppDelegateCode(src);
    return config;
  });
};

const withIOSAuth0InfoPList: ConfigPlugin<Auth0PluginConfig> = (
  config,
  props,
) => {
  return withInfoPlist(config, config => {
    return addIOSAuth0ConfigInInfoPList(props, config);
  });
};

export const addIOSAuth0ConfigInInfoPList = (
  props: Auth0PluginConfig,
  config: ExportedConfigWithProps<InfoPlist>,
) => {
  if (!config.modResults.CFBundleURLTypes) {
    config.modResults.CFBundleURLTypes = [];
  }
  let auth0Scheme =
    props.customScheme ??
    config.ios?.bundleIdentifier ??
    (() => {
      throw new Error(
        'No auth0 scheme specified or bundle identifier found in expo config',
      );
    })();
  if (auth0Scheme) {
    if (
      config.modResults.CFBundleURLTypes.some(({CFBundleURLSchemes}) =>
        CFBundleURLSchemes.includes(auth0Scheme),
      )
    ) {
      return config;
    }
    config.modResults.CFBundleURLTypes.push({
      CFBundleURLName: 'auth0',
      CFBundleURLSchemes: [auth0Scheme],
    });
  }
  return config;
};

type Auth0PluginConfig = {
  customScheme?: string;
  domain?: string;
};

const withAuth0: ConfigPlugin<Auth0PluginConfig> = (config, props) => {
  if (!props?.domain) {
    throw Error('No auth0 domain specified in expo config');
  }

  config = withAndroidAuth0Gradle(config, props);
  config = withIOSAuth0AppDelegate(config, props);
  config = withIOSAuth0InfoPList(config, props);
  return config;
};

export default createRunOncePlugin(withAuth0, pkg.name, pkg.version);
