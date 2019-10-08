## Setup the development environment

This project uses yarn.

- Run `yarn install` to set up the environment.
- Make the changes you desire and push them to a Github repository.
- On your application project, run `yarn add <git remote url>#<branch/commit/tag>`.
- Run the tests with `yarn test`.

For more information, see [yarn docs](https://yarnpkg.com/lang/en/docs/cli/add/).

## Instructions to perform a new release

- Create a new milestone in Github with the name `vx.y.z` where `x.y.z` mean major, minor and patch versions (semver).
- Add any issues or pull request to the milestone. Make sure they are assigned one of the changelog labels (CH).
- Run `yarn release` and follow the instructions. If making a _patch_ release run `yarn release patch`. If making a _minor_ release run `yarn release minor`. The version will be updated in the package.json file and the changelog retrieved. If this step fails make sure the version in the package.json file matches the milestone you've created in Github.
- The release script will generate the updated docs, bump the package version in the package.json and telemetry.js files and update the CHANGELOG.md file.
- A new commit will be created for you containing these changes. A new git tag will reference this new release.
- Create a new pull request and wait for it to be merged. Once merged when the CI build for the base branch passes, you're ready to upload the package to npm.
- Make sure you're on the tag you just created, if not run `git checkout vx.y.z`.
- Upload the package to npm by running `npm publish`
