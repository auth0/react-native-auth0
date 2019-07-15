## Instructions to perform a new release

- Create a new milestone in Github with the name `vx.y.z` where `x.y.z` mean major, minor and patch versions (semver).
- Add any issues or pull request to the milestone. Make sure they are assigned one of the changelog labels (CH).
- From the terminal check out a new branch, e.g. `git checkout -b perform-release`.
- Make sure you're in a clean release state. Run `npm run release:clean`
- If making a _patch_ release run `npm version patch`. If making a _minor_ release run `npm version minor`. The version will be updated in the package.json file and the changelog retrieved. If this step fails make sure the version in the package.json file matches the milestone you've created in Github.
- The release script will generate the updated docs, bump the package version in the package.json file and update the CHANGELOG.md file.
- A new commit will be created for you containing these changes. A new git tag will reference this new release.
- Push the changes and the new tag to Github `git push origin HEAD --tags`.
- Create a pull request and wait for it to be merged. Once merged when the CI build passes, you're ready to upload the package to npm.
- Make sure you're on the tag you just created, if not run `git checkout vx.y.z`.
- Upload the package to npm by running `npm publish`
