import {
  addAuth0GradleValues,
  addAuth0AppDelegateCode,
  withIOSAuth0InfoPList,
} from '../withAuth0';
import appDelegateFixtureWithLinking from './fixtures/appdelegate-withlinking';
import appDelegateFixtureWithoutLinking from './fixtures/appdelegate-withoutlinking';
import buildGradleFixture from './fixtures/buildgradle';
import {error} from 'console';

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
