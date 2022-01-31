'use strict';
Object.defineProperty(exports, '__esModule', {value: true});
exports.addAuth0AppDelegateCode = exports.addAuth0GradleValues = void 0;
const config_plugins_1 = require('@expo/config-plugins');
const generateCode_1 = require('@expo/config-plugins/build/utils/generateCode');
let pkg = {
  name: 'react-native-auth0',
};
try {
  pkg = require('react-native-auth0/package.json');
} catch (_a) {
  // empty catch block
}
const addAuth0GradleValues = (
  src,
  auth0Domain,
  auth0Scheme = 'applicationId',
) => {
  if (!auth0Domain) {
    throw Error('No auth0 domain specified in expo config');
  }
  return (0, generateCode_1.mergeContents)({
    tag: 'react-native-auth0-manifest-placeholder',
    src,
    newSrc: `manifestPlaceholders = [auth0Domain: "${auth0Domain}", auth0Scheme: "${auth0Scheme}"]`,
    anchor: /defaultConfig {/,
    offset: 1,
    comment: '//',
  }).contents;
};
exports.addAuth0GradleValues = addAuth0GradleValues;
const withAndroidAuth0Gradle = (config, {android, scheme, domain} = {}) => {
  return (0, config_plugins_1.withAppBuildGradle)(config, config => {
    if (config.modResults.language === 'groovy') {
      const auth0Domain =
        (android === null || android === void 0 ? void 0 : android.domain) ||
        domain;
      const auth0Scheme =
        (android === null || android === void 0 ? void 0 : android.scheme) ||
        scheme ||
        '${applicationId}';
      config.modResults.contents = (0, exports.addAuth0GradleValues)(
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
  });
};
const addAuth0AppDelegateCode = src => {
  let tempSrc = src;
  // Tests to see if the RCTLinkingManager has already been added
  if (
    !/\[RCTLinkingManager.*application:.*openURL:.*options:.*\]/.test(tempSrc)
  ) {
    tempSrc = (0, generateCode_1.mergeContents)({
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
    tempSrc = (0, generateCode_1.mergeContents)({
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
exports.addAuth0AppDelegateCode = addAuth0AppDelegateCode;
const withIOSAuth0AppDelegate = config => {
  return (0, config_plugins_1.withAppDelegate)(config, config => {
    const src = config.modResults.contents;
    config.modResults.contents = (0, exports.addAuth0AppDelegateCode)(src);
    return config;
  });
};
const withIOSAuth0InfoPList = (config, {ios, scheme} = {}) => {
  return (0, config_plugins_1.withInfoPlist)(config, config => {
    if (!config.modResults.CFBundleURLTypes) {
      config.modResults.CFBundleURLTypes = [];
    }
    const auth0Scheme =
      (ios === null || ios === void 0 ? void 0 : ios.scheme) || scheme;
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
  });
};
const withAuth0 = (config, props) => {
  config = withAndroidAuth0Gradle(config, props);
  config = withIOSAuth0AppDelegate(config, props);
  config = withIOSAuth0InfoPList(config, props);
  return config;
};
exports.default = (0, config_plugins_1.createRunOncePlugin)(
  withAuth0,
  pkg.name,
  pkg.version,
);
