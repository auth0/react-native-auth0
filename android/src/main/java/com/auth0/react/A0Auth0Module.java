package com.auth0.react;

import android.app.Activity;
import android.content.Intent;
import android.content.ActivityNotFoundException;
import android.net.Uri;
import androidx.annotation.NonNull;
import android.util.Base64;

import com.auth0.android.Auth0;
import com.auth0.android.authentication.AuthenticationAPIClient;
import com.auth0.android.authentication.storage.CredentialsManagerException;
import com.auth0.android.authentication.storage.SecureCredentialsManager;
import com.auth0.android.authentication.storage.SharedPreferencesStorage;
import com.auth0.android.result.Credentials;
import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
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
    private static final String ERROR_CODE = "a0.invalid_state.credential_manager_exception";
    private static final int LOCAL_AUTH_REQUEST_CODE = 150;

    private final ReactApplicationContext reactContext;
    private Callback callback;

    private SecureCredentialsManager secureCredentialsManager;
    public A0Auth0Module(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        this.reactContext.addActivityEventListener(this);
    }

    @ReactMethod
    public void initializeCredentialManager(String clientId, String domain) {
        Auth0 auth0 = new Auth0(clientId, domain);
        AuthenticationAPIClient authenticationAPIClient = new AuthenticationAPIClient(auth0);
        this.secureCredentialsManager = new SecureCredentialsManager(
                reactContext,
                authenticationAPIClient,
                new SharedPreferencesStorage(reactContext)
        );
    }

    @ReactMethod
    public void hasValidCredentialManagerInstance(Promise promise) {
        promise.resolve(this.secureCredentialsManager != null);
    }

    @ReactMethod
    public void getCredentials(String scope, double minTtl, ReadableMap parameters, Promise promise) {
        Map<String,String> cleanedParameters = new HashMap<>();
        for (Map.Entry<String, Object> entry : parameters.toHashMap().entrySet()) {
            if (entry.getValue() != null) {
                cleanedParameters.put(entry.getKey(), entry.getValue().toString());
            }
        }

        this.secureCredentialsManager.getCredentials(scope, (int) minTtl, cleanedParameters, new com.auth0.android.callback.Callback<Credentials, CredentialsManagerException>() {
            @Override
            public void onSuccess(Credentials credentials) {
                ReadableMap map = CredentialsParser.toMap(credentials);
                promise.resolve(map);
            }

            @Override
            public void onFailure(@NonNull CredentialsManagerException e) {
                promise.reject(ERROR_CODE, e.getMessage());
            }
        });
    }

    @ReactMethod
    public void saveCredentials(ReadableMap credentials, Promise promise) {
        try {
            this.secureCredentialsManager.saveCredentials(CredentialsParser.fromMap(credentials));
            promise.resolve(true);
        } catch (CredentialsManagerException e) {
            promise.reject(ERROR_CODE, e.getMessage());
        }
    }

    @ReactMethod
    public void enableLocalAuthentication(String title, String description, Promise promise) {
        Activity activity = reactContext.getCurrentActivity();
        if (activity == null) {
            promise.reject(ERROR_CODE, "No current activity present");
            return;
        }
        try {
            this.secureCredentialsManager.requireAuthentication(activity, LOCAL_AUTH_REQUEST_CODE, title, description);
            promise.resolve(true);
        } catch (CredentialsManagerException e){
            promise.reject(ERROR_CODE, e.getMessage());
        }
    }

    @ReactMethod
    public void clearCredentials(Promise promise) {
        this.secureCredentialsManager.clearCredentials();
        promise.resolve(true);
    }

    @ReactMethod
    public void hasValidCredentials(double minTtl, Promise promise) {
        promise.resolve(this.secureCredentialsManager.hasValidCredentials((long) minTtl));
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
            if (activity != null) {
                AuthenticationActivity.authenticateUsingBrowser(activity, parsedUrl);
            } else {
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

        if(requestCode == LOCAL_AUTH_REQUEST_CODE) {
            secureCredentialsManager.checkAuthenticationResult(requestCode, resultCode);
            return;
        }

        if (cb == null) {
            return;
        }

        boolean hasResult = resultCode == RESULT_OK &&
                requestCode == AuthenticationActivity.AUTHENTICATION_REQUEST &&
                data.getData() != null;
        if (hasResult) {
            cb.invoke(null, data.getData().toString());
        } else {
            final WritableMap error = Arguments.createMap();
            error.putString("error", "a0.session.user_cancelled");
            error.putString("error_description", "User cancelled the Auth");
            cb.invoke(error);
        }

        A0Auth0Module.this.callback = null;
    }

    @Override
    public void onNewIntent(Intent intent) {
        // NO OP
    }

}