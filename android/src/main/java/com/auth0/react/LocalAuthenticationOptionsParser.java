package com.auth0.react;

import com.auth0.android.authentication.storage.AuthenticationLevel;
import com.auth0.android.authentication.storage.LocalAuthenticationOptions;
import com.facebook.react.bridge.ReadableMap;

public class LocalAuthenticationOptionsParser {
    private static final String TITLE_KEY = "title";
    private static final String SUBTITLE_KEY = "subtitle";
    private static final String DESCRIPTION_KEY = "description";
    private static final String CANCEL_TITLE_KEY = "cancel";
    private static final String AUTHENTICATION_LEVEL_KEY = "authenticationLevel";
    private static final String DEVICE_CREDENTIAL_FALLBACK_KEY = "deviceCredentialFallback";


    public static LocalAuthenticationOptions fromMap(ReadableMap map) {
        String title = map.getString(TITLE_KEY);
        if (title == null) {
            throw new IllegalArgumentException("LocalAuthenticationOptionsParser: fromMap: The 'title' field is required");
        }
        String subtitle = map.getString(SUBTITLE_KEY);
        String description = map.getString(DESCRIPTION_KEY);
        String cancelTitle = map.getString(CANCEL_TITLE_KEY);

        boolean deviceCredentialFallback = map.getBoolean(DEVICE_CREDENTIAL_FALLBACK_KEY);
        LocalAuthenticationOptions.Builder builder = new LocalAuthenticationOptions.Builder()
                .setTitle(title)
                .setSubTitle(subtitle)
                .setDescription(description)
                .setDeviceCredentialFallback(deviceCredentialFallback);

        if (!map.hasKey(AUTHENTICATION_LEVEL_KEY)) {
            builder.setAuthenticationLevel(AuthenticationLevel.STRONG);
        } else {
            AuthenticationLevel level = getAuthenticationLevelFromInt(map.getInt(AUTHENTICATION_LEVEL_KEY));
            builder.setAuthenticationLevel(level);
        }
        if (cancelTitle != null) {
            builder.setNegativeButtonText(cancelTitle);
        }
        return builder.build();
    }

    static AuthenticationLevel getAuthenticationLevelFromInt(int level) {
        switch (level) {
            case 0:
                return AuthenticationLevel.STRONG;
            case 1:
                return AuthenticationLevel.WEAK;
            default:
                return AuthenticationLevel.DEVICE_CREDENTIAL;
        }
    }
}

