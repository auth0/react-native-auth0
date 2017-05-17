/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  Linking,
  NativeModules
} from 'react-native';

const { A0Auth0 } = NativeModules;

export default class auth0 extends Component {

  componentDidMount() {
    Linking.addEventListener('url', this.onRedirect);
  }

  componentWillUnmount() {
    Linking.removeEventListener('url', this.onRedirect);
  }

  render() {
    return (
      <View style={styles.container}>
        <TouchableHighlight underlayColor="black" onPress={this.showBrowser}>
          <Text style={styles.openBrowser}>
          Open Browser
          </Text>
        </TouchableHighlight>
      </View>
    );
  }

  showBrowser() {
    const domain = "overmind.auth0.com";
    const redirectUri = `${A0Auth0.bundleIdentifier}://${domain}/ios/${A0Auth0.bundleIdentifier}/callback`;
    A0Auth0.oauthParameters(console.log);
    A0Auth0.showUrl(`https://overmind.auth0.com/authorize?client_id=4DCWVEwbnzqsyedUsXFlZ8v1a8sObJPp&response_type=token&redirect_uri=${redirectUri}`, console.log);
  }

  onRedirect(event) {
    console.log(`Received url ${event.url}`);
    A0Auth0.hide();
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  openBrowser: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
});

AppRegistry.registerComponent('auth0', () => auth0);
