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
  Linking
} from 'react-native';

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
    Linking.openURL("https://overmind.auth0.com/authorize?client_id=4DCWVEwbnzqsyedUsXFlZ8v1a8sObJPp&response_type=token&redirect_uri=org.reactjs.native.example.auth0://overmind.auth0.com/ios/org.reactjs.native.example.auth0/callback");
  }

  onRedirect(event) {
    console.log(`Received url ${event.url}`);
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
