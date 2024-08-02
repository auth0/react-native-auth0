import { AndroidConfig, ExportedConfigWithProps } from 'expo/config-plugins';
import {
  addAndroidAuth0Manifest,
  addAuth0AppDelegateCode,
  addIOSAuth0ConfigInInfoPList,
} from '../withAuth0';
import appDelegateFixtureWithLinking from './fixtures/appdelegate-withlinking';
import appDelegateFixtureWithoutLinking from './fixtures/appdelegate-withoutlinking';
import { ModConfig } from '@expo/config-plugins';

const getConfig = () => {
  return {
    name: ' ',
    slug: ' ',
    modRequest: {
      projectRoot: '',
      platformProjectRoot: '',
      modName: '',
      platform: 'android' as keyof ModConfig,
      introspect: true,
    },
    modResults: {
      manifest: {
        $: {
          'xmlns:android': 'http://schemas.android.com/apk/res/android',
        },
        queries: [],
        application: [
          {
            $: {
              'android:name': 'com.auth0.android.tests.MainApplication',
            },
            activity: [
              {
                $: {
                  'android:name': 'com.auth0.android.provider.RedirectActivity',
                },
              },
            ],
          },
        ],
      },
    },
    modRawConfig: {
      name: ' ',
      slug: ' ',
    },
  } as ExportedConfigWithProps<AndroidConfig.Manifest.AndroidManifest>;
};

describe(addAuth0AppDelegateCode, () => {
  it(`does not modify the AppDelegate`, () => {
    expect(
      addAuth0AppDelegateCode(appDelegateFixtureWithLinking)
    ).toMatchSnapshot();
  });
});

describe(addAuth0AppDelegateCode, () => {
  it(`modifies the AppDelegate`, () => {
    expect(
      addAuth0AppDelegateCode(appDelegateFixtureWithoutLinking)
    ).toMatchSnapshot();
  });
});

describe(addAndroidAuth0Manifest, () => {
  it(`should throw if domain is not present when config sent as array`, () => {
    function domainCheck() {
      addAndroidAuth0Manifest([], getConfig());
    }
    expect(domainCheck).toThrowErrorMatchingSnapshot();
  });

  it(`should throw if domain is not present when config sent as object`, () => {
    function domainCheck() {
      addAndroidAuth0Manifest([{}], getConfig());
    }
    expect(domainCheck).toThrowErrorMatchingSnapshot();
  });

  it(`should throw if scheme & applicationId is not present`, () => {
    function domainCheck() {
      addAndroidAuth0Manifest([{ domain: 'sample.auth0.com' }], getConfig());
    }
    expect(domainCheck).toThrowErrorMatchingSnapshot();
  });

  it(`without scheme should have package name`, () => {
    function check() {
      return addAndroidAuth0Manifest(
        [{ domain: 'sample.auth0.com' }],
        getConfig(),
        'com.auth0.sample'
      );
    }
    expect(check()).toMatchSnapshot();
  });

  it(`with scheme should have that value`, () => {
    function check() {
      return addAndroidAuth0Manifest(
        [
          {
            domain: 'sample.auth0.com',
            customScheme: 'com.sample.application',
          },
        ],
        getConfig()
      );
    }
    expect(check()).toMatchSnapshot();
  });

  it(`with multiple domains should have that value and package name as scheme`, () => {
    function check() {
      return addAndroidAuth0Manifest(
        [
          {
            domain: 'sample.us.auth0.com',
          },
          {
            domain: 'sample.eu.auth0.com',
          },
        ],
        getConfig(),
        'com.sample.application'
      );
    }
    expect(check()).toMatchSnapshot();
  });

  it(`with multiple domains and schemes should have that value`, () => {
    function check() {
      return addAndroidAuth0Manifest(
        [
          {
            domain: 'sample.us.auth0.com',
            customScheme: 'com.sample.us.auth0',
          },
          {
            domain: 'sample.eu.auth0.com',
            customScheme: 'com.sample.eu.auth0',
          },
        ],
        getConfig(),
        'com.sample.application'
      );
    }
    expect(check()).toMatchSnapshot();
  });
});

describe(addIOSAuth0ConfigInInfoPList, () => {
  it(`should throw if scheme and bundle identifier is not defined`, () => {
    const config: any = {
      name: ' ',
      slug: ' ',
      modRequest: {
        projectRoot: '',
        platformProjectRoot: '',
        modName: '',
        platform: 'ios' as keyof ModConfig,
        introspect: true,
      },
      modResults: { path: '', contents: '' },
    };
    function checkWithEmptyObject() {
      return addIOSAuth0ConfigInInfoPList([{}], config);
    }
    function checkWithEmptyArray() {
      return addIOSAuth0ConfigInInfoPList([], config);
    }
    expect(checkWithEmptyObject).toThrowErrorMatchingSnapshot();
    expect(checkWithEmptyArray).toThrowErrorMatchingSnapshot();
  });

  it(`should have the scheme provided `, () => {
    const config: any = {
      name: ' ',
      slug: ' ',
      modRequest: {
        projectRoot: '',
        platformProjectRoot: '',
        modName: '',
        platform: 'ios' as keyof ModConfig,
        introspect: true,
      },
      ios: {
        bundleIdentifier: 'different.bundle.id',
      },
      modResults: { path: '', contents: '' },
    };
    function check() {
      return addIOSAuth0ConfigInInfoPList(
        [{ customScheme: 'com.sample.auth0' }],
        config
      );
    }
    expect(check()).toMatchSnapshot();
  });

  it(`should have the bundle identifier if scheme is not provided `, () => {
    const config: any = {
      name: ' ',
      slug: ' ',
      modRequest: {
        projectRoot: '',
        platformProjectRoot: '',
        modName: '',
        platform: 'ios' as keyof ModConfig,
        introspect: true,
      },
      ios: {
        bundleIdentifier: 'com.sample.auth0',
      },
      modResults: { path: '', contents: '' },
    };
    function checkWithEmptyObject() {
      return addIOSAuth0ConfigInInfoPList([{}], config);
    }
    function checkWithEmptyArray() {
      return addIOSAuth0ConfigInInfoPList([], config);
    }
    expect(checkWithEmptyObject()).toMatchSnapshot();
    expect(checkWithEmptyArray()).toMatchSnapshot();
  });

  it(`should ignore if scheme is already present`, () => {
    const config: any = {
      name: ' ',
      slug: ' ',
      modRequest: {
        projectRoot: '',
        platformProjectRoot: '',
        modName: '',
        platform: 'ios' as keyof ModConfig,
        introspect: true,
      },
      modResults: {
        path: '',
        contents: '',
        CFBundleURLTypes: [
          {
            CFBundleURLName: 'auth0',
            CFBundleURLSchemes: ['com.sample.auth0'],
          },
        ],
      },
    };
    function check() {
      return addIOSAuth0ConfigInInfoPList(
        [{ customScheme: 'com.sample.auth0' }],
        config
      );
    }
    expect(check()).toMatchSnapshot();
  });

  it(`should append if another scheme is already present`, () => {
    const config: any = {
      name: ' ',
      slug: ' ',
      modRequest: {
        projectRoot: '',
        platformProjectRoot: '',
        modName: '',
        platform: 'ios' as keyof ModConfig,
        introspect: true,
      },
      modResults: {
        path: '',
        contents: '',
        CFBundleURLTypes: [
          {
            CFBundleURLName: 'auth0',
            CFBundleURLSchemes: ['com.differentsample.auth0'],
          },
        ],
      },
    };
    function check() {
      return addIOSAuth0ConfigInInfoPList(
        [{ customScheme: 'com.sample.auth0' }],
        config
      );
    }
    expect(check()).toMatchSnapshot();
  });

  it(`should append all the schemes`, () => {
    const config: any = {
      name: ' ',
      slug: ' ',
      modRequest: {
        projectRoot: '',
        platformProjectRoot: '',
        modName: '',
        platform: 'ios' as keyof ModConfig,
        introspect: true,
      },
      modResults: {
        path: '',
        contents: '',
        CFBundleURLTypes: [
          {
            CFBundleURLName: 'auth0',
            CFBundleURLSchemes: ['com.differentsample.auth0'],
          },
        ],
      },
    };
    function check() {
      return addIOSAuth0ConfigInInfoPList(
        [
          { customScheme: 'com.sample.us.auth0' },
          { customScheme: 'com.sample.eu.auth0' },
        ],
        config
      );
    }
    expect(check()).toMatchSnapshot();
  });

  it(`should add all the schemes`, () => {
    const config: any = {
      name: ' ',
      slug: ' ',
      modRequest: {
        projectRoot: '',
        platformProjectRoot: '',
        modName: '',
        platform: 'ios' as keyof ModConfig,
        introspect: true,
      },
      modResults: {
        path: '',
        contents: '',
      },
    };
    function check() {
      return addIOSAuth0ConfigInInfoPList(
        [
          { customScheme: 'com.sample.us.auth0' },
          { customScheme: 'com.sample.eu.auth0' },
        ],
        config
      );
    }
    expect(check()).toMatchSnapshot();
  });
});
