package com.auth0.react;

import android.app.Activity;
import android.content.Intent;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.FragmentActivity;

import com.auth0.android.Auth0;
import com.auth0.android.authentication.AuthenticationException;
import com.auth0.android.authentication.storage.CredentialsManagerException;
import com.auth0.android.authentication.storage.LocalAuthenticationOptions;
import com.auth0.android.authentication.storage.SecureCredentialsManager;
import com.auth0.android.authentication.storage.SharedPreferencesStorage;
import com.auth0.android.provider.WebAuthProvider;
import com.auth0.android.result.Credentials;
import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.UiThreadUtil;
import java.net.MalformedURLException;
import java.net.URL;

import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

public class A0Auth0Module extends A0Auth0Spec implements ActivityEventListener {

    private final Map<CredentialsManagerException, String> ERROR_CODE_MAP = new HashMap<>() {{
        put(CredentialsManagerException.Companion.getINVALID_CREDENTIALS(), "INVALID_CREDENTIALS");
        put(CredentialsManagerException.Companion.getNO_CREDENTIALS(), "NO_CREDENTIALS");
        put(CredentialsManagerException.Companion.getNO_REFRESH_TOKEN(), "NO_REFRESH_TOKEN");
        put(CredentialsManagerException.Companion.getRENEW_FAILED(), "RENEW_FAILED");
        put(CredentialsManagerException.Companion.getSTORE_FAILED(), "STORE_FAILED");
        put(CredentialsManagerException.Companion.getREVOKE_FAILED(), "REVOKE_FAILED");
        put(CredentialsManagerException.Companion.getLARGE_MIN_TTL(), "LARGE_MIN_TTL");
        put(CredentialsManagerException.Companion.getINCOMPATIBLE_DEVICE(), "INCOMPATIBLE_DEVICE");
        put(CredentialsManagerException.Companion.getCRYPTO_EXCEPTION(), "CRYPTO_EXCEPTION");
        put(CredentialsManagerException.Companion.getBIOMETRIC_ERROR_NO_ACTIVITY(), "BIOMETRIC_NO_ACTIVITY");
        put(CredentialsManagerException.Companion.getBIOMETRIC_ERROR_STATUS_UNKNOWN(), "BIOMETRIC_ERROR_STATUS_UNKNOWN");
        put(CredentialsManagerException.Companion.getBIOMETRIC_ERROR_UNSUPPORTED(), "BIOMETRIC_ERROR_UNSUPPORTED");
        put(CredentialsManagerException.Companion.getBIOMETRIC_ERROR_HW_UNAVAILABLE(), "BIOMETRIC_ERROR_HW_UNAVAILABLE");
        put(CredentialsManagerException.Companion.getBIOMETRIC_ERROR_NONE_ENROLLED(), "BIOMETRIC_ERROR_NONE_ENROLLED");
        put(CredentialsManagerException.Companion.getBIOMETRIC_ERROR_NO_HARDWARE(), "BIOMETRIC_ERROR_NO_HARDWARE");
        put(CredentialsManagerException.Companion.getBIOMETRIC_ERROR_SECURITY_UPDATE_REQUIRED(), "BIOMETRIC_ERROR_SECURITY_UPDATE_REQUIRED");
        put(CredentialsManagerException.Companion.getBIOMETRIC_AUTHENTICATION_CHECK_FAILED(), "BIOMETRIC_AUTHENTICATION_CHECK_FAILED");
        put(CredentialsManagerException.Companion.getBIOMETRIC_ERROR_DEVICE_CREDENTIAL_NOT_AVAILABLE(), "BIOMETRIC_ERROR_DEVICE_CREDENTIAL_NOT_AVAILABLE");
        put(CredentialsManagerException.Companion.getBIOMETRIC_ERROR_STRONG_AND_DEVICE_CREDENTIAL_NOT_AVAILABLE(), "BIOMETRIC_ERROR_STRONG_AND_DEVICE_CREDENTIAL_NOT_AVAILABLE");
        put(CredentialsManagerException.Companion.getBIOMETRIC_ERROR_NO_DEVICE_CREDENTIAL(), "BIOMETRIC_ERROR_NO_DEVICE_CREDENTIAL");
        put(CredentialsManagerException.Companion.getBIOMETRIC_ERROR_NEGATIVE_BUTTON(), "BIOMETRIC_ERROR_NEGATIVE_BUTTON");
        put(CredentialsManagerException.Companion.getBIOMETRIC_ERROR_HW_NOT_PRESENT(), "BIOMETRIC_ERROR_HW_NOT_PRESENT");
        put(CredentialsManagerException.Companion.getBIOMETRIC_ERROR_NO_BIOMETRICS(), "BIOMETRIC_ERROR_NO_BIOMETRICS");
        put(CredentialsManagerException.Companion.getBIOMETRIC_ERROR_USER_CANCELED(), "BIOMETRIC_ERROR_USER_CANCELED");
        put(CredentialsManagerException.Companion.getBIOMETRIC_ERROR_LOCKOUT_PERMANENT(), "BIOMETRIC_ERROR_LOCKOUT_PERMANENT");
        put(CredentialsManagerException.Companion.getBIOMETRIC_ERROR_VENDOR(), "BIOMETRIC_ERROR_VENDOR");
        put(CredentialsManagerException.Companion.getBIOMETRIC_ERROR_LOCKOUT(), "BIOMETRIC_ERROR_LOCKOUT");
        put(CredentialsManagerException.Companion.getBIOMETRIC_ERROR_CANCELED(), "BIOMETRIC_ERROR_CANCELED");
        put(CredentialsManagerException.Companion.getBIOMETRIC_ERROR_NO_SPACE(), "BIOMETRIC_ERROR_NO_SPACE");
        put(CredentialsManagerException.Companion.getBIOMETRIC_ERROR_TIMEOUT(), "BIOMETRIC_ERROR_TIMEOUT");
        put(CredentialsManagerException.Companion.getBIOMETRIC_ERROR_UNABLE_TO_PROCESS(), "BIOMETRIC_ERROR_UNABLE_TO_PROCESS");
        put(CredentialsManagerException.Companion.getBIOMETRICS_INVALID_USER(), "BIOMETRICS_INVALID_USER");
        put(CredentialsManagerException.Companion.getBIOMETRIC_AUTHENTICATION_FAILED(), "BIOMETRIC_AUTHENTICATION_FAILED");
        put(CredentialsManagerException.Companion.getAPI_ERROR(), "API_ERROR");
        put(CredentialsManagerException.Companion.getNO_NETWORK(), "NO_NETWORK");
    }};
    private static final String CREDENTIAL_MANAGER_ERROR_CODE = "a0.invalid_state.credential_manager_exception";
    private static final String INVALID_DOMAIN_URL_ERROR_CODE = "a0.invalid_domain_url";
    private static final String BIOMETRICS_AUTHENTICATION_ERROR_CODE = "a0.invalid_options_biometrics_authentication";
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
    @Override
    public void webAuth(String scheme, String redirectUri, @Nullable String state, @Nullable String nonce, @Nullable String audience, @Nullable String scope, @Nullable String connection, @Nullable Double maxAge, @Nullable String organization, @Nullable String invitationUrl, @Nullable Double leeway, @Nullable Boolean ephemeralSession, @Nullable Double safariViewControllerPresentationStyle, @Nullable ReadableMap additionalParameters, Promise promise) {
        this.webAuthPromise = promise;
        Map<String, String> cleanedParameters = new HashMap<>();
        
        if(additionalParameters != null) {
            for (Map.Entry<String, Object> entry : additionalParameters.toHashMap().entrySet()) {
                if (entry.getValue() != null) {
                    cleanedParameters.put(entry.getKey(), entry.getValue().toString());
                }
            }
        }
        WebAuthProvider.Builder builder = WebAuthProvider.login(this.auth0)
                .withScheme(scheme);
        if (state != null) {
            builder.withState(state);
        }
        if (nonce != null) {
            builder.withNonce(nonce);
        }
        if (audience != null) {
            builder.withAudience(audience);
        }
        if (scope != null) {
            builder.withScope(scope);
        }
        if (connection != null) {
            builder.withConnection(connection);
        }
        if (maxAge != null && maxAge.intValue() != 0) {
            builder.withMaxAge(maxAge.intValue());
        }
        if (organization != null) {
            builder.withOrganization(organization);
        }
        if (invitationUrl != null) {
            builder.withInvitationUrl(invitationUrl);
        }
        if (leeway != null && leeway.intValue() != 0) {
            builder.withIdTokenVerificationLeeway(leeway.intValue());
        }
        if (redirectUri != null) {
            builder.withRedirectUri(redirectUri);
        }
        builder.withParameters(cleanedParameters);
        builder.start(reactContext.getCurrentActivity(),
                new com.auth0.android.callback.Callback<Credentials, AuthenticationException>() {
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
    public void getBundleIdentifier(Promise promise) {
        String packageName = reactContext.getApplicationInfo().packageName;
        promise.resolve(packageName);
    }

    @ReactMethod
    public void initializeAuth0WithConfiguration(String clientId, String domain, ReadableMap localAuthenticationOptions, Promise promise) {
        this.auth0 = Auth0.getInstance(clientId, domain);
        if (localAuthenticationOptions != null) {
            Activity activity = getCurrentActivity();
            if (activity instanceof FragmentActivity) {
                try {
                    LocalAuthenticationOptions localAuthOptions = LocalAuthenticationOptionsParser.fromMap(localAuthenticationOptions);
                    this.secureCredentialsManager = new SecureCredentialsManager(
                            reactContext,
                            auth0,
                            new SharedPreferencesStorage(reactContext),
                            (FragmentActivity) activity,
                            localAuthOptions);
                    promise.resolve(true);
                    return;
                } catch (Exception e) {
                    this.secureCredentialsManager = getSecureCredentialsManagerWithoutBiometrics();
                    promise.reject(BIOMETRICS_AUTHENTICATION_ERROR_CODE, "Failed to parse the Local Authentication Options, hence proceeding without Biometrics Authentication for handling Credentials");
                    return;
                }
            } else {
                this.secureCredentialsManager = getSecureCredentialsManagerWithoutBiometrics();
                promise.reject(BIOMETRICS_AUTHENTICATION_ERROR_CODE, "Biometrics Authentication for Handling Credentials are supported only on FragmentActivity, since a different activity is supplied, proceeding without it");
                return;
            }
        }
        this.secureCredentialsManager = getSecureCredentialsManagerWithoutBiometrics();
        promise.resolve(true);
    }

    private @NonNull SecureCredentialsManager getSecureCredentialsManagerWithoutBiometrics() {
        return new SecureCredentialsManager(
                reactContext,
                auth0,
                new SharedPreferencesStorage(reactContext));
    }

    @ReactMethod
    public void hasValidAuth0InstanceWithConfiguration(String clientId, String domain, Promise promise) {
        if(this.auth0 == null) {
            promise.resolve(false);
            return;
        }
        String currentDomain;
        try {
            URL domainUrl = new URL(this.auth0.getDomainUrl());
            currentDomain = domainUrl.getHost();
        } catch (MalformedURLException e) {
            promise.reject(INVALID_DOMAIN_URL_ERROR_CODE, "Invalid domain URL", e);
            return;
        }
        promise.resolve(this.auth0.getClientId().equals(clientId) && currentDomain.equals(domain));
    }

    @ReactMethod
    public void getCredentials(String scope, double minTtl, ReadableMap parameters, boolean forceRefresh,
                               Promise promise) {
        Map<String, String> cleanedParameters = new HashMap<>();
        for (Map.Entry<String, Object> entry : parameters.toHashMap().entrySet()) {
            if (entry.getValue() != null) {
                cleanedParameters.put(entry.getKey(), entry.getValue().toString());
            }
        }

        UiThreadUtil.runOnUiThread(() -> secureCredentialsManager.getCredentials(scope, (int) minTtl, cleanedParameters, forceRefresh,
                new com.auth0.android.callback.Callback<Credentials, CredentialsManagerException>() {
                    @Override
                    public void onSuccess(Credentials credentials) {
                        ReadableMap map = CredentialsParser.toMap(credentials);
                        promise.resolve(map);
                    }

                    @Override
                    public void onFailure(@NonNull CredentialsManagerException e) {
                        String errorCode = deduceErrorCode(e);
                        promise.reject(errorCode, e.getMessage(), e);
                    }
                }));
    }

    private String deduceErrorCode(@NonNull CredentialsManagerException e) {
        return ERROR_CODE_MAP.getOrDefault(e, CREDENTIAL_MANAGER_ERROR_CODE);
    }

    @ReactMethod
    public void saveCredentials(ReadableMap credentials, Promise promise) {
        try {
            this.secureCredentialsManager.saveCredentials(CredentialsParser.fromMap(credentials));
            promise.resolve(true);
        } catch (CredentialsManagerException e) {
            String errorCode = deduceErrorCode(e);
            promise.reject(errorCode, e.getMessage(), e);
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
        return NAME;
    }

    @ReactMethod
    public void webAuthLogout(String scheme, boolean federated, String redirectUri, Promise promise) {
        WebAuthProvider.LogoutBuilder builder = WebAuthProvider.logout(this.auth0)
                .withScheme(scheme);
        if (federated) {
            builder.withFederated();
        }
        if (redirectUri != null) {
            builder.withReturnToUrl(redirectUri);
        }
        builder.start(reactContext.getCurrentActivity(),
                new com.auth0.android.callback.Callback<Void, AuthenticationException>() {
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

    @Override
    public void resumeWebAuth(String url, Promise promise) {
        // dummy function implementation, as this is only needed in iOS
        promise.resolve(true);
    }

    @Override
    public void cancelWebAuth(Promise promise) {
        // dummy function implementation, as this is only needed in iOS
        promise.resolve(true);
    }

    private void handleError(AuthenticationException error, Promise promise) {
        if (error.isBrowserAppNotAvailable()) {
            promise.reject("a0.browser_not_available", "No Browser application is installed.", error);
            return;
        }
        if (error.isCanceled()) {
            promise.reject("a0.session.user_cancelled", "User cancelled the Auth", error);
            return;
        }
        if (error.isNetworkError()) {
            promise.reject("a0.network_error", "Network error", error);
            return;
        }
        if (error.isIdTokenValidationError()) {
            promise.reject("a0.session.invalid_idtoken", "Error validating ID Token", error);
            return;
        }
        String separator = error.getMessage().endsWith(".") ? "" : ".";
        promise.reject(error.getCode(), error.getMessage() + separator + " CAUSE: " + error.getDescription(), error);
    }

    @Override
    public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
        // No-op
    }

    @Override
    public void onNewIntent(Intent intent) {
        if (webAuthPromise != null) {
            webAuthPromise.reject("a0.session.browser_terminated",
                    "The browser window was closed by a new instance of the application");
            webAuthPromise = null;
        }
    }

    public static final String NAME = "A0Auth0";
}