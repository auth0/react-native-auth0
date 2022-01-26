## Setup the development environment

To test the SDK manually, follow the below steps

- Ensure [yarn](https://yarnpkg.com/) is setup in your machine.
- Download or Clone the sample app from [here](https://github.com/auth0-samples/auth0-react-native-sample/tree/master/00-Login).
- Change the path of react-native-auth0 in package.json to the path of the SDK in your computer

```shell
"react-native-auth0": "../{PATH IN COMPUTER}/react-native-auth0"
```

- Few folders have to be deleted to ensure the correct version of the SDK is installed.

```shell
rm -rf node_modules ios/Pods ios/Podfile.lock
```

- Install the required dependencies.

```shell
yarn install && ( cd ios && pod install )
```

- run `yarn run android` or `yarn run ios` to run the app with the new version of SDK
