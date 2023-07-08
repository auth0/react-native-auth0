## Running the Example Application 🏃‍♂️

The Example application can be used for development purpose of the SDK. To integrate with Auth0, it is better to use the [Quickstart](https://auth0.com/docs/quickstart/native/react-native/interactive) and [Sample App](https://github.com/auth0-samples/auth0-react-native-sample/tree/master/00-Login-Hooks) applications

To run the example application inside the repository, follow these steps:

1. Open a terminal or command prompt.
2. Run `yarn run bootstrap` to set up the project.
3. Run `yarn run prepare` to build the project.
4. To run the application:
   For Android, run `yarn example android`.
   For iOS, run `yarn example ios`.

The application will be built and launched on the specified platform, allowing you to interact with it.

### To run on different Auth0 Application

1. Change the `clientId` and `domain` value in `example/src/auth0-configuration.js`
2. For Android, Change the `auth0Domain` value in `example/android/app/build.gradle`

```
manifestPlaceholders = [auth0Domain: "YOUR_DOMAIN_HERE", auth0Scheme: "${applicationId}"]
```
