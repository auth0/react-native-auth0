package com.auth0.react

import com.auth0.android.result.Credentials
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableNativeMap
import java.util.Date

object CredentialsParser {

    private const val ACCESS_TOKEN_KEY = "accessToken"
    private const val ID_TOKEN_KEY = "idToken"
    private const val EXPIRES_AT_KEY = "expiresAt"
    private const val SCOPE = "scope"
    private const val REFRESH_TOKEN_KEY = "refreshToken"
    private const val TOKEN_TYPE_KEY = "tokenType"
    private const val DATE_FORMAT = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"

    fun toMap(credentials: Credentials): ReadableMap {
        val map = WritableNativeMap()
        map.putString(ACCESS_TOKEN_KEY, credentials.accessToken)
        map.putDouble(EXPIRES_AT_KEY, credentials.expiresAt.time / 1000.0)
        map.putString(ID_TOKEN_KEY, credentials.idToken)
        map.putString(SCOPE, credentials.scope)
        map.putString(REFRESH_TOKEN_KEY, credentials.refreshToken)
        map.putString(TOKEN_TYPE_KEY, credentials.type)
        return map
    }

    fun fromMap(map: ReadableMap): Credentials {
        val idToken = map.getString(ID_TOKEN_KEY) ?: ""
        val accessToken = map.getString(ACCESS_TOKEN_KEY) ?: ""
        val tokenType = map.getString(TOKEN_TYPE_KEY) ?: ""
        val refreshToken = map.getString(REFRESH_TOKEN_KEY)
        val scope = map.getString(SCOPE)
        val expiresAtUnix = map.getDouble(EXPIRES_AT_KEY)
        val expiresAt = Date((expiresAtUnix * 1000).toLong())

        return Credentials(
            idToken,
            accessToken,
            tokenType,
            refreshToken,
            expiresAt,
            scope
        )
    }
}
