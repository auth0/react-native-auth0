
package com.auth0.react;

import android.app.Activity;
import android.app.PendingIntent;
import android.content.Intent;
import android.net.Uri;
import android.support.annotation.NonNull;
import android.support.customtabs.CustomTabsIntent;
import android.util.Base64;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;

import java.io.UnsupportedEncodingException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.HashMap;
import java.util.Map;

public class A0Auth0Module extends ReactContextBaseJavaModule implements LifecycleEventListener {

    private static final String US_ASCII = "US-ASCII";
    private static final String SHA_256 = "SHA-256";

    private final ReactApplicationContext reactContext;
    private Callback callback;

    public A0Auth0Module(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        this.reactContext.addLifecycleEventListener(this);
    }

    @Override
    public String getName() {
        return "A0Auth0";
    }

    @Override
    public Map<String, Object> getConstants() {
        final Map<String, Object> constants = new HashMap<>();
        constants.put("bundleIdentifier", reactContext.getApplicationInfo().packageName);
        return constants;
    }

    @ReactMethod
    public void showUrl(String url, boolean closeOnLoad, Callback callback) {
        final Activity activity = getCurrentActivity();

        this.callback = callback;
        if (activity != null) {
            CustomTabsIntent.Builder builder = new CustomTabsIntent.Builder();
            CustomTabsIntent customTabsIntent = builder.build();
            customTabsIntent.launchUrl(activity, Uri.parse(url));
        } else {
            final Intent intent = new Intent(Intent.ACTION_VIEW);
            intent.setData(Uri.parse(url));
            getReactApplicationContext().startActivity(intent);
        }
    }

    @ReactMethod
    public void oauthParameters(Callback callback) {
        final String verifier = this.generateRandomValue();
        final WritableMap parameters = Arguments.createMap();
        parameters.putString("verifier", verifier);
        parameters.putString("code_challenge", this.generateCodeChallenge(verifier));
        parameters.putString("code_challenge_method", "S256");
        parameters.putString("state", this.generateRandomValue());
        callback.invoke(parameters);
    }

    @ReactMethod
    public void hide() {
        // NO OP
    }

    private String getBase64String(byte[] source) {
        return Base64.encodeToString(source, Base64.URL_SAFE | Base64.NO_WRAP | Base64.NO_PADDING);
    }

    byte[] getASCIIBytes(String value) {
        byte[] input;
        try {
            input = value.getBytes(US_ASCII);
        } catch (UnsupportedEncodingException e) {
            throw new IllegalStateException("Could not convert string to an ASCII byte array", e);
        }
        return input;
    }

    byte[] getSHA256(byte[] input) {
        byte[] signature;
        try {
            MessageDigest md = MessageDigest.getInstance(SHA_256);
            md.update(input, 0, input.length);
            signature = md.digest();
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("Failed to get SHA-256 signature", e);
        }
        return signature;
    }

    String generateRandomValue() {
        SecureRandom sr = new SecureRandom();
        byte[] code = new byte[32];
        sr.nextBytes(code);
        return this.getBase64String(code);
    }

    String generateCodeChallenge(@NonNull String codeVerifier) {
        byte[] input = getASCIIBytes(codeVerifier);
        byte[] signature = getSHA256(input);
        return getBase64String(signature);
    }

    @Override
    public void onHostResume() {
        if (this.callback != null) {
            final WritableMap error = Arguments.createMap();
            error.putString("error", "a0.session.user_cancelled");
            error.putString("error_description", "User cancelled the Auth");
            this.callback.invoke(error);
            this.callback = null;
        }
    }

    @Override
    public void onHostPause() {

    }

    @Override
    public void onHostDestroy() {

    }
}