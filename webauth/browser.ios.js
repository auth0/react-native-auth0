import {
  NativeModules
} from 'react-native';

const { A0Auth0 } = NativeModules;

export default class BrowserIOS {

  show(url, callback) {
    A0Auth0.showUrl(url, callback);
  }

  hide() {
    A0Auth0.hide();
  }
}