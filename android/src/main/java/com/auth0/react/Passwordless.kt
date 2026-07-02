package com.auth0.react

import com.auth0.android.Auth0
import com.auth0.android.authentication.AuthenticationAPIClient
import com.auth0.android.authentication.AuthenticationException
import com.auth0.android.authentication.passwordless.DeliveryMethod
import com.auth0.android.result.Credentials
import com.auth0.android.result.PasswordlessChallenge
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.WritableNativeMap

class Passwordless(
    private val auth0: Auth0,
    private val useDPoP: Boolean,
    private val reactContext: ReactApplicationContext
) {

    private fun createClient(): AuthenticationAPIClient {
        val client = AuthenticationAPIClient(auth0)
        if (useDPoP) {
            client.useDPoP(reactContext)
        }
        return client
    }

    fun challengeWithEmail(
        email: String,
        connection: String,
        allowSignup: Boolean,
        promise: Promise
    ) {
        createClient().passwordlessClient()
            .challengeWithEmail(email, connection, allowSignup)
            .start(object : com.auth0.android.callback.Callback<PasswordlessChallenge, AuthenticationException> {
                override fun onSuccess(result: PasswordlessChallenge) {
                    val map = WritableNativeMap().apply {
                        putString("authSession", result.authSession)
                    }
                    promise.resolve(map)
                }

                override fun onFailure(error: AuthenticationException) {
                    promise.reject("PASSWORDLESS_CHALLENGE_FAILED", error.getDescription(), error)
                }
            })
    }

    fun challengeWithPhoneNumber(
        phoneNumber: String,
        connection: String,
        deliveryMethod: String,
        allowSignup: Boolean,
        promise: Promise
    ) {
        val method = if (deliveryMethod == "voice") DeliveryMethod.VOICE else DeliveryMethod.TEXT

        createClient().passwordlessClient()
            .challengeWithPhoneNumber(phoneNumber, connection, method, allowSignup)
            .start(object : com.auth0.android.callback.Callback<PasswordlessChallenge, AuthenticationException> {
                override fun onSuccess(result: PasswordlessChallenge) {
                    val map = WritableNativeMap().apply {
                        putString("authSession", result.authSession)
                    }
                    promise.resolve(map)
                }

                override fun onFailure(error: AuthenticationException) {
                    promise.reject("PASSWORDLESS_CHALLENGE_FAILED", error.getDescription(), error)
                }
            })
    }

    fun loginWithOTP(
        authSession: String,
        otp: String,
        audience: String?,
        scope: String?,
        promise: Promise
    ) {
        val finalScope = if (scope.isNullOrBlank()) "openid profile email" else scope
        val finalAudience = audience?.trim()?.ifEmpty { null }

        val request = createClient().passwordlessClient()
            .loginWithOTP(PasswordlessChallenge(authSession), otp)
        finalAudience?.let { request.setAudience(it) }
        request.setScope(finalScope)

        request.start(object : com.auth0.android.callback.Callback<Credentials, AuthenticationException> {
            override fun onSuccess(result: Credentials) {
                promise.resolve(CredentialsParser.toMap(result))
            }

            override fun onFailure(error: AuthenticationException) {
                promise.reject("PASSWORDLESS_LOGIN_FAILED", error.getDescription(), error)
            }
        })
    }
}
