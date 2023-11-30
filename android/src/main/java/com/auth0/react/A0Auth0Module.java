package com.auth0.react;

import android.app.Activity;
import android.content.Intent;
import android.content.ActivityNotFoundException;
import android.net.Uri;
import androidx.annotation.NonNull;
import android.util.Base64;

import com.auth0.android.Auth0;
import com.auth0.android.authentication.AuthenticationAPIClient;
import com.auth0.android.authentication.AuthenticationException;
import com.auth0.android.authentication.storage.CredentialsManagerException;
import com.auth0.android.authentication.storage.SecureCredentialsManager;
import com.auth0.android.authentication.storage.SharedPreferencesStorage;
import com.auth0.android.provider.WebAuthProvider;
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

    private static final String ERROR_CODE = "a0.invalid_state.credential_manager_exception";
    private static final int LOCAL_AUTH_REQUEST_CODE = 150;
    public static final int UNKNOWN_ERROR_RESULT_CODE = 1405;

    private final ReactApplicationContext reactContext;
    private Auth0 auth0;
    private SecureCredentialsManager secureCredentialsManager;
    private Promise webAuthPromise;

    public A0Auth0Module(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        this.reactContext.addActivityEventListener(this);
    }

    @ReactMethod
    public void initializeAuth0(String clientId, String domain) {
        this.auth0 = new Auth0(clientId, domain);
        AuthenticationAPIClient authenticationAPIClient = new AuthenticationAPIClient(auth0);
        this.secureCredentialsManager = new SecureCredentialsManager(
                reactContext,
                authenticationAPIClient,
                new SharedPreferencesStorage(reactContext)
        );
    }

    @ReactMethod
    public void hasValidAuth0Instance(Promise promise) {
        promise.resolve(this.auth0 != null && this.secureCredentialsManager != null);
    }

    @ReactMethod
    public void getCredentials(String scope, double minTtl, ReadableMap parameters, boolean forceRefresh, Promise promise) {
        Map<String,String> cleanedParameters = new HashMap<>();
        for (Map.Entry<String, Object> entry : parameters.toHashMap().entrySet()) {
            if (entry.getValue() != null) {
                cleanedParameters.put(entry.getKey(), entry.getValue().toString());
            }
        }

        this.secureCredentialsManager.getCredentials(scope, (int) minTtl, cleanedParameters, forceRefresh, new com.auth0.android.callback.Callback<Credentials, CredentialsManagerException>() {
            @Override
            public void onSuccess(Credentials credentials) {
                ReadableMap map = CredentialsParser.toMap(credentials);
                promise.resolve(map);
            }

            @Override
            public void onFailure(@NonNull CredentialsManagerException e) {
                promise.reject(ERROR_CODE, e.getMessage(), e);
            }
        });
    }

    @ReactMethod
    public void saveCredentials(ReadableMap credentials, Promise promise) {
        try {
            this.secureCredentialsManager.saveCredentials(CredentialsParser.fromMap(credentials));
            promise.resolve(true);
        } catch (CredentialsManagerException e) {
            promise.reject(ERROR_CODE, e.getMessage(), e);
        }
    }

    @ReactMethod
    public void enableLocalAuthentication(String title, String description, Promise promise) {
        Activity activity = reactContext.getCurrentActivity();
        if (activity == null) {
            promise.reject(ERROR_CODE, "No current activity present");
            return;
        }
        activity.runOnUiThread(() -> {
            try {
                A0Auth0Module.this.secureCredentialsManager.requireAuthentication(activity, LOCAL_AUTH_REQUEST_CODE, title, description);
                promise.resolve(true);
            } catch (CredentialsManagerException e){
                promise.reject(ERROR_CODE, e.getMessage(), e);
            }
        });
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
    public void webAuth(String scheme, String redirectUri, String state, String nonce, String audience, String scope, String connection, int maxAge, String organization, String invitationUrl, int leeway, boolean ephemeralSession, int safariViewControllerPresentationStyle, ReadableMap additionalParameters, Promise promise) {
        this.webAuthPromise = promise;
        Map<String,String> cleanedParameters = new HashMap<>();
        for (Map.Entry<String, Object> entry : additionalParameters.toHashMap().entrySet()) {
            if (entry.getValue() != null) {
                cleanedParameters.put(entry.getKey(), entry.getValue().toString());
            }
        }
        WebAuthProvider.Builder builder = WebAuthProvider.login(this.auth0)
                .withScheme(scheme);
        if(state != null) {
            builder.withState(state);
        }
        if(nonce != null) {
            builder.withNonce(nonce);
        }
        if(audience != null) {
            builder.withAudience(audience);
        }
        if(scope != null) {
            builder.withScope(scope);
        }
        if(connection != null) {
            builder.withConnection(connection);
        }
        if(maxAge != 0) {
            builder.withMaxAge(maxAge);
        }
        if(organization != null) {
            builder.withOrganization(organization);
        }
        if(invitationUrl != null) {
            builder.withInvitationUrl(invitationUrl);
        }
        if(leeway != 0) {
            builder.withIdTokenVerificationLeeway(leeway);
        }
        if(redirectUri != null) {
            builder.withRedirectUri(redirectUri);
        }
        builder.withParameters(cleanedParameters);
        builder.start(reactContext.getCurrentActivity(), new com.auth0.android.callback.Callback<Credentials, AuthenticationException>() {
                    @Override
                    public void onSuccess(Credentials result) {
                        ReadableMap map = CredentialsParser.toMap(result);
                        promise.resolve(map);
                        webAuthPromise = null;
                    }

                    @Override
                    public void onFailure(@NonNull AuthenticationException error) {
                        handleError(error, promise);
                        webAuthPromise = null;
                    }
                });
    }

    @ReactMethod
    public void webAuthLogout(String scheme, boolean federated, String redirectUri, Promise promise) {
        WebAuthProvider.LogoutBuilder builder = WebAuthProvider.logout(this.auth0)
                .withScheme(scheme);
        if(federated) {
            builder.withFederated();
        }
        if(redirectUri != null) {
            builder.withReturnToUrl(redirectUri);
        }
        builder.start(reactContext.getCurrentActivity(), new com.auth0.android.callback.Callback<Void, AuthenticationException>() {
            @Override
            public void onSuccess(Void credentials) {
                promise.resolve(true);
            }

            @Override
            public void onFailure(AuthenticationException e) {
                handleError(e, promise);
            }
        });
    }

    private void handleError(AuthenticationException error, Promise promise) {
        if(error.isBrowserAppNotAvailable()) {
            promise.reject("a0.browser_not_available", "No Browser application is installed.", error);
            return;
        }
        if(error.isCanceled()) {
            promise.reject("a0.session.user_cancelled", "User cancelled the Auth", error);
            return;
        }
        if(error.isNetworkError()) {
            promise.reject("a0.network_error", "Network error", error);
            return;
        }
        if(error.isIdTokenValidationError()) {
            promise.reject("a0.session.invalid_idtoken", "Error validating ID Token", error);
            return;
        }
        String separator = error.getMessage().endsWith(".") ? "" : ".";
        promise.reject(error.getCode(), error.getMessage() + separator + " CAUSE: " + error.getDescription(), error);
    }

    @Override
    public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
        if(requestCode == LOCAL_AUTH_REQUEST_CODE) {
            secureCredentialsManager.checkAuthenticationResult(requestCode, resultCode);
        }
    }

    @Override
    public void onNewIntent(Intent intent) {
        if(webAuthPromise != null) {
            webAuthPromise.reject("a0.session.browser_terminated", "The browser window was closed by a new instance of the application");
            webAuthPromise = null;
        }
    }
}