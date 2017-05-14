
package com.auth0.react;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Callback;

public class A0Auth0Module extends ReactContextBaseJavaModule {

  private final ReactApplicationContext reactContext;

  public A0Auth0Module(ReactApplicationContext reactContext) {
    super(reactContext);
    this.reactContext = reactContext;
  }

  @Override
  public String getName() {
    return "A0Auth0";
  }
}