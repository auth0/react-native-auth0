import {addAuth0GradleValues, addAuth0AppDelegateCode} from '../withAuth0';
import appDelegateFixtureWithLinking from './fixtures/appdelegate-withlinking';
import appDelegateFixtureWithoutLinking from './fixtures/appdelegate-withoutlinking';
import buildGradleFixture from './fixtures/buildgradle';

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
