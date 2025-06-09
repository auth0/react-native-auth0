package com.auth0.react;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.Promise;

public abstract class A0Auth0Spec extends ReactContextBaseJavaModule {

    protected A0Auth0Spec(ReactApplicationContext context) {
        super(context);
    }

    public abstract void multiply(double a, double b, Promise promise);
}