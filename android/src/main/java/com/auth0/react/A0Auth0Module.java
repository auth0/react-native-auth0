package com.auth0.react;

import android.app.Activity;
import android.content.Intent;
import android.content.ActivityNotFoundException;
import android.net.Uri;
import androidx.annotation.NonNull;
import android.util.Base64;

import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
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

import static android.app.Activity.RESULT_OK;

public class A0Auth0Module extends ReactContextBaseJavaModule implements ActivityEventListener {

    private static final String US_ASCII = "US-ASCII";
    private static final String SHA_256 = "SHA-256";

    private final ReactApplicationContext reactContext;
    private Callback callback;

    public A0Auth0Module(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        this.reactContext.addActivityEventListener(this);
    }

    @Override
    public Map<String, Object> getConstants() {
        final Map<String, Object> constants = new HashMap<>();
        constants.put("bundleIdentifier", reactContext.getApplicationInfo().packageName);
        return constants;
    }

    @NonNull
    @Override
    public String getName() {
        return "A0Auth0";
    }

    @ReactMethod
    public void showUrl(String url, boolean closeOnLoad, Callback callback) {
        final Activity activity = getCurrentActivity();
        final Uri parsedUrl = Uri.parse(url);
        this.callback = callback;

        try {
            if (activity != null) AuthenticationActivity.authenticateUsingBrowser(activity, parsedUrl);
            else {
                final WritableMap error = Arguments.createMap();
                error.putString("error", "a0.activity_not_available");
                error.putString("error_description", "Android Activity is null.");
                callback.invoke(error);
            }
        } catch (ActivityNotFoundException e){
            final WritableMap error = Arguments.createMap();
            error.putString("error", "a0.browser_not_available");
            error.putString("error_description", "No Browser application is installed.");
            callback.invoke(error);
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
    public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
        Callback cb = A0Auth0Module.this.callback;

        if (cb != null) {
            boolean hasResult = resultCode == RESULT_OK && 
                requestCode == AuthenticationActivity.AUTHENTICATION_REQUEST &&
                data.getData() != null;
            if (hasResult) cb.invoke(null, data.getData().toString());
            else {
                final WritableMap error = Arguments.createMap();
                error.putString("error", "a0.session.user_cancelled");
                error.putString("error_description", "User cancelled the Auth");
                cb.invoke(error);
            }

            A0Auth0Module.this.callback = null;
        }
    }

    @Override
    public void onNewIntent(Intent intent) {
        // NO OP
    }

}
