package com.auth0.react;

import com.auth0.android.authentication.storage.CredentialsManagerException;
import com.auth0.android.result.Credentials;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableNativeMap;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

public class CredentialsParser {

    private static final String ACCESS_TOKEN_KEY = "accessToken";
    private static final String ID_TOKEN_KEY = "idToken";
    private static final String EXPIRES_AT_KEY = "expiresAt";
    private static final String SCOPE = "scope";
    private static final String REFRESH_TOKEN_KEY = "refreshToken";
    private static final String TYPE_KEY = "type";
    private static final String TOKEN_TYPE_KEY = "tokenType";
    private static final String EXPIRES_IN_KEY = "expiresIn";
    private static final String DATE_FORMAT = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'";

    public static ReadableMap toMap(Credentials credentials) {
        WritableNativeMap map = new WritableNativeMap();
        map.putString(ACCESS_TOKEN_KEY, credentials.getAccessToken());
        map.putDouble(EXPIRES_AT_KEY, credentials.getExpiresAt().getTime());
        map.putString(ID_TOKEN_KEY, credentials.getIdToken());
        map.putString(SCOPE, credentials.getScope());
        map.putString(REFRESH_TOKEN_KEY, credentials.getRefreshToken());
        map.putString(TYPE_KEY, credentials.getType());
        return map;
    }

    public static Credentials fromMap(ReadableMap map) {
        String idToken = map.getString(ID_TOKEN_KEY);
        String accessToken = map.getString(ACCESS_TOKEN_KEY);
        String tokenType = map.getString(TOKEN_TYPE_KEY);
        String refreshToken = map.getString(REFRESH_TOKEN_KEY);
        String scope = map.getString(SCOPE);
        SimpleDateFormat sdf = new SimpleDateFormat(DATE_FORMAT, Locale.US);
        Date expiresAt = null;
        String expiresAtText = map.getString(EXPIRES_AT_KEY);
        if(expiresAtText != null) {
            try {
                expiresAt = sdf.parse(expiresAtText);
            } catch (ParseException e) {
                throw new CredentialsManagerException("Invalid date format - "+expiresAtText, e);
            }
        }
        double expiresIn = 0;
        if(map.hasKey(EXPIRES_IN_KEY)) {
            expiresIn = map.getDouble(EXPIRES_IN_KEY);
        }
        if (expiresAt == null && expiresIn != 0) {
            expiresAt = new Date((long) (System.currentTimeMillis() + expiresIn * 1000));
        }
        return new Credentials(
                idToken,
                accessToken,
                tokenType,
                refreshToken,
                expiresAt,
                scope
        );
    }
}
