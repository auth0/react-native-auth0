package com.auth0.react;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.common.internal.DoNotStrip;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;

public abstract class A0Auth0Spec extends ReactContextBaseJavaModule {

    protected A0Auth0Spec(ReactApplicationContext context) {
        super(context);
    }

    @NonNull
    @Override
    public abstract String getName();

    @ReactMethod
    @DoNotStrip
    public abstract void getBundleIdentifier(Promise promise);

    @ReactMethod
    @DoNotStrip
    public abstract void hasValidAuth0InstanceWithConfiguration(String clientId, String domain, Promise promise);

    @ReactMethod
    @DoNotStrip
    public abstract void initializeAuth0WithConfiguration(String clientId, String domain, @Nullable ReadableMap localAuthenticationOptions, Promise promise);

    @ReactMethod
    @DoNotStrip
    public abstract void saveCredentials(ReadableMap credentials, Promise promise);

    @ReactMethod
    @DoNotStrip
    public abstract void getCredentials(@Nullable String scope, double minTTL, ReadableMap parameters, boolean forceRefresh, Promise promise);

    @ReactMethod
    @DoNotStrip
    public abstract void hasValidCredentials(double minTTL, Promise promise);

    @ReactMethod
    @DoNotStrip
    public abstract void clearCredentials(Promise promise);

    @ReactMethod
    @DoNotStrip
    public abstract void webAuth(String scheme, String redirectUri, @Nullable String state, @Nullable String nonce, @Nullable String audience, @Nullable String scope, @Nullable String connection, @Nullable Double maxAge, @Nullable String organization, @Nullable String invitationUrl, @Nullable Double leeway, @Nullable Boolean ephemeralSession, @Nullable Double safariViewControllerPresentationStyle, @Nullable ReadableMap additionalParameters, Promise promise);

    @ReactMethod
    @DoNotStrip
    public abstract void webAuthLogout(String scheme, boolean federated, String redirectUri, Promise promise);

    @ReactMethod
    @DoNotStrip
    public abstract void resumeWebAuth(String url, Promise promise);

    @ReactMethod
    @DoNotStrip
    public abstract void cancelWebAuth(Promise promise);
}