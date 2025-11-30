package com.auth0.react

import com.auth0.android.result.APICredentials
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReadableMap

object ApiCredentialsParser {

    private const val ACCESS_TOKEN_KEY = "accessToken"
    private const val EXPIRES_AT_KEY = "expiresAt"
    private const val SCOPE_KEY = "scope"
    private const val TOKEN_TYPE_KEY = "tokenType"

    fun toMap(credentials: APICredentials): ReadableMap {
        val map = Arguments.createMap()
        map.putString(ACCESS_TOKEN_KEY, credentials.accessToken)
        map.putDouble(EXPIRES_AT_KEY, credentials.expiresAt.time / 1000.0)
        map.putString(SCOPE_KEY, credentials.scope)
        map.putString(TOKEN_TYPE_KEY, credentials.type)
        return map
    }
}
