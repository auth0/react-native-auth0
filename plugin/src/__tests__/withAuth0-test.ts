import {
  addAuth0GradleValues,
  addAuth0AppDelegateCode,
  addAndroidAuth0Gradle,
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

  it(`without scheme should have "applicationId"`, () => {
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
        {domain: 'sample.auth0.com', scheme: 'com.sample.application'},
        config,
      );
    }
    expect(check()).toMatchSnapshot();
  });
});
