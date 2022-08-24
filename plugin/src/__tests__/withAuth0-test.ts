import {
  addAuth0GradleValues,
  addAuth0AppDelegateCode,
  addAndroidAuth0Gradle,
  addIOSAuth0ConfigInInfoPList,
} from '../withAuth0';
import appDelegateFixtureWithLinking from './fixtures/appdelegate-withlinking';
import appDelegateFixtureWithoutLinking from './fixtures/appdelegate-withoutlinking';
import buildGradleFixture from './fixtures/buildgradle';
import {ModConfig} from '@expo/config-plugins';

describe(addAuth0GradleValues, () => {
  it(`modifies the build.gradle`, () => {
    expect(
      addAuth0GradleValues(
        buildGradleFixture,
        'com.example.app',
        'com.example.app',
      ),
    ).toMatchSnapshot();
  });

  it(`modifies the build.gradle without custom scheme`, () => {
    expect(
      addAuth0GradleValues(buildGradleFixture, 'com.example.app'),
    ).toMatchSnapshot();
  });
});

describe(addAuth0AppDelegateCode, () => {
  it(`does not modify the AppDelegate`, () => {
    expect(
      addAuth0AppDelegateCode(appDelegateFixtureWithLinking),
    ).toMatchSnapshot();
  });
});

describe(addAuth0AppDelegateCode, () => {
  it(`modifies the AppDelegate`, () => {
    expect(
      addAuth0AppDelegateCode(appDelegateFixtureWithoutLinking),
    ).toMatchSnapshot();
  });
});

describe(addAndroidAuth0Gradle, () => {
  it(`should throw if file is kt`, () => {
    const config = {
      name: ' ',
      slug: ' ',
      modRequest: {
        projectRoot: '',
        platformProjectRoot: '',
        modName: '',
        platform: 'android' as keyof ModConfig,
        introspect: true,
      },
      modResults: {path: '', language: 'kt' as const, contents: ''},
    };
    function ktFileCheck() {
      addAndroidAuth0Gradle({}, config);
    }
    expect(ktFileCheck).toThrowErrorMatchingSnapshot();
  });

  it(`should throw if domain is not present`, () => {
    const config = {
      name: ' ',
      slug: ' ',
      modRequest: {
        projectRoot: '',
        platformProjectRoot: '',
        modName: '',
        platform: 'android' as keyof ModConfig,
        introspect: true,
      },
      modResults: {path: '', language: 'groovy' as const, contents: ''},
    };
    function domainCheck() {
      addAndroidAuth0Gradle({}, config);
    }
    expect(domainCheck).toThrowErrorMatchingSnapshot();
  });

  it(`should throw if scheme is not present`, () => {
    const config = {
      name: ' ',
      slug: ' ',
      modRequest: {
        projectRoot: '',
        platformProjectRoot: '',
        modName: '',
        platform: 'android' as keyof ModConfig,
        introspect: true,
      },
      modResults: {path: '', language: 'groovy' as const, contents: ''},
    };
    function domainCheck() {
      addAndroidAuth0Gradle({domain: 'sample.auth0.com'}, config);
    }
    expect(domainCheck).toThrowErrorMatchingSnapshot();
  });

  it(`without scheme should have package name`, () => {
    const config = {
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
        path: '',
        language: 'groovy' as const,
        contents: buildGradleFixture,
      },
      android: {
        package: 'com.auth0.sample',
      },
    };
    function check() {
      return addAndroidAuth0Gradle({domain: 'sample.auth0.com'}, config);
    }
    expect(check()).toMatchSnapshot();
  });

  it(`with scheme should have that value`, () => {
    const config = {
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
        path: '',
        language: 'groovy' as const,
        contents: buildGradleFixture,
      },
    };
    function check() {
      return addAndroidAuth0Gradle(
        {domain: 'sample.auth0.com', customScheme: 'com.sample.application'},
        config,
      );
    }
    expect(check()).toMatchSnapshot();
  });
});

describe(addIOSAuth0ConfigInInfoPList, () => {
  it(`should throw if scheme and bundle identifier is not defined`, () => {
    const config = {
      name: ' ',
      slug: ' ',
      modRequest: {
        projectRoot: '',
        platformProjectRoot: '',
        modName: '',
        platform: 'ios' as keyof ModConfig,
        introspect: true,
      },
      modResults: {path: '', contents: ''},
    };
    function check() {
      addIOSAuth0ConfigInInfoPList({}, config);
    }
    expect(check).toThrowErrorMatchingSnapshot();
  });

  it(`should have the scheme provided `, () => {
    const config = {
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
      modResults: {path: '', contents: ''},
    };
    function check() {
      return addIOSAuth0ConfigInInfoPList(
        {customScheme: 'com.sample.auth0'},
        config,
      );
    }
    expect(check()).toMatchSnapshot();
  });

  it(`should have the bundle identifier if scheme is not provided `, () => {
    const config = {
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
      modResults: {path: '', contents: ''},
    };
    function check() {
      return addIOSAuth0ConfigInInfoPList({}, config);
    }
    expect(check()).toMatchSnapshot();
  });

  it(`should ignore if scheme is already present`, () => {
    const config = {
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
        {customScheme: 'com.sample.auth0'},
        config,
      );
    }
    expect(check()).toMatchSnapshot();
  });

  it(`should not ignore if another scheme is already present`, () => {
    const config = {
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
        {customScheme: 'com.sample.auth0'},
        config,
      );
    }
    expect(check()).toMatchSnapshot();
  });
});
