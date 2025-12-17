package com.auth0.react

import com.facebook.common.internal.DoNotStrip
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap

abstract class A0Auth0Spec(context: ReactApplicationContext) : ReactContextBaseJavaModule(context) {

    abstract override fun getName(): String

    @ReactMethod
    @DoNotStrip
    abstract fun getBundleIdentifier(promise: Promise)

    @ReactMethod
    @DoNotStrip
    abstract fun hasValidAuth0InstanceWithConfiguration(clientId: String, domain: String, promise: Promise)

    @ReactMethod
    @DoNotStrip
    abstract fun initializeAuth0WithConfiguration(
        clientId: String,
        domain: String,
        localAuthenticationOptions: ReadableMap?,
        useDPoP: Boolean?,
        promise: Promise
    )

    @ReactMethod
    @DoNotStrip
    abstract fun saveCredentials(credentials: ReadableMap, promise: Promise)

    @ReactMethod
    @DoNotStrip
    abstract fun getCredentials(
        scope: String?,
        minTTL: Double,
        parameters: ReadableMap,
        forceRefresh: Boolean,
        promise: Promise
    )

    @ReactMethod
    @DoNotStrip
    abstract fun hasValidCredentials(minTTL: Double, promise: Promise)

    @ReactMethod
    @DoNotStrip
    abstract fun clearCredentials(audience: String?, scope: String?, promise: Promise)

    @ReactMethod
    @DoNotStrip
    abstract fun getApiCredentials(
        audience: String,
        scope: String?,
        minTTL: Double,
        parameters: ReadableMap,
        promise: Promise
    )

    @ReactMethod
    @DoNotStrip
    abstract fun clearApiCredentials(audience: String, scope: String?, promise: Promise)

    @ReactMethod
    @DoNotStrip
    abstract fun webAuth(
        scheme: String,
        redirectUri: String?,
        state: String?,
        nonce: String?,
        audience: String?,
        scope: String?,
        connection: String?,
        maxAge: Double?,
        organization: String?,
        invitationUrl: String?,
        leeway: Double?,
        ephemeralSession: Boolean?,
        safariViewControllerPresentationStyle: Double?,
        additionalParameters: ReadableMap?,
        promise: Promise
    )

    @ReactMethod
    @DoNotStrip
    abstract fun webAuthLogout(scheme: String, federated: Boolean, redirectUri: String?, promise: Promise)

    @ReactMethod
    @DoNotStrip
    abstract fun resumeWebAuth(url: String, promise: Promise)

    @ReactMethod
    @DoNotStrip
    abstract fun cancelWebAuth(promise: Promise)

    @ReactMethod
    @DoNotStrip
    abstract fun getDPoPHeaders(url: String, method: String, accessToken: String, tokenType: String, nonce: String?, promise: Promise)

    @ReactMethod
    @DoNotStrip
    abstract fun clearDPoPKey(promise: Promise)

    @ReactMethod
    @DoNotStrip
    abstract fun getSSOCredentials(parameters: ReadableMap?, headers: ReadableMap?, promise: Promise)
}