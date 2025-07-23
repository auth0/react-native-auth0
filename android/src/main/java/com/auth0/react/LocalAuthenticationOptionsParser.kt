package com.auth0.react

import com.auth0.android.authentication.storage.AuthenticationLevel
import com.auth0.android.authentication.storage.LocalAuthenticationOptions
import com.facebook.react.bridge.ReadableMap

object LocalAuthenticationOptionsParser {
    private const val TITLE_KEY = "title"
    private const val SUBTITLE_KEY = "subtitle"
    private const val DESCRIPTION_KEY = "description"
    private const val CANCEL_TITLE_KEY = "cancel"
    private const val AUTHENTICATION_LEVEL_KEY = "authenticationLevel"
    private const val DEVICE_CREDENTIAL_FALLBACK_KEY = "deviceCredentialFallback"

    fun fromMap(map: ReadableMap): LocalAuthenticationOptions {
        val title = map.getString(TITLE_KEY)
            ?: throw IllegalArgumentException("LocalAuthenticationOptionsParser: fromMap: The 'title' field is required")
        
        val subtitle = map.getString(SUBTITLE_KEY)
        val description = map.getString(DESCRIPTION_KEY)
        val cancelTitle = map.getString(CANCEL_TITLE_KEY)
        val deviceCredentialFallback = map.getBoolean(DEVICE_CREDENTIAL_FALLBACK_KEY)
        
        val builder = LocalAuthenticationOptions.Builder()
            .setTitle(title)
            .setSubTitle(subtitle)
            .setDescription(description)
            .setDeviceCredentialFallback(deviceCredentialFallback)

        if (!map.hasKey(AUTHENTICATION_LEVEL_KEY)) {
            builder.setAuthenticationLevel(AuthenticationLevel.STRONG)
        } else {
            val level = getAuthenticationLevelFromInt(map.getInt(AUTHENTICATION_LEVEL_KEY))
            builder.setAuthenticationLevel(level)
        }
        
        cancelTitle?.let { builder.setNegativeButtonText(it) }
        
        return builder.build()
    }

    private fun getAuthenticationLevelFromInt(level: Int): AuthenticationLevel {
        return when (level) {
            0 -> AuthenticationLevel.STRONG
            1 -> AuthenticationLevel.WEAK
            else -> AuthenticationLevel.DEVICE_CREDENTIAL
        }
    }
}

