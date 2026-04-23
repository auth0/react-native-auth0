package com.auth0.react

import com.auth0.android.Auth0
import com.auth0.android.authentication.AuthenticationAPIClient
import com.auth0.android.authentication.mfa.MfaEnrollmentType
import com.auth0.android.authentication.mfa.MfaException
import com.auth0.android.authentication.mfa.MfaVerificationType
import com.auth0.android.result.Authenticator
import com.auth0.android.result.Credentials
import com.auth0.android.result.EnrollmentChallenge
import com.auth0.android.result.OobEnrollmentChallenge
import com.auth0.android.result.RecoveryCodeEnrollmentChallenge
import com.auth0.android.result.TotpEnrollmentChallenge
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.WritableNativeArray
import com.facebook.react.bridge.WritableNativeMap

/**
 * A dedicated bridge class for MFA (Multi-Factor Authentication) operations.
 * Encapsulates all MFA-related native SDK interactions, keeping them separate
 * from the main A0Auth0Module for better organization and maintainability.
 */
class MfaBridge(
    private val auth0: Auth0,
    private val useDPoP: Boolean,
    private val reactContext: ReactApplicationContext
) {

    private fun createAuthClient(): AuthenticationAPIClient {
        val client = AuthenticationAPIClient(auth0)
        if (useDPoP) {
            client.useDPoP(reactContext)
        }
        return client
    }

    fun getAuthenticators(mfaToken: String, factorsAllowed: ReadableArray?, promise: Promise) {
        val mfaClient = createAuthClient().mfaClient(mfaToken)

        val factors = mutableListOf<String>()
        factorsAllowed?.let {
            for (i in 0 until it.size()) {
                it.getString(i)?.let { factor -> factors.add(factor) }
            }
        }

        mfaClient.getAuthenticators(factors).start(
            object : com.auth0.android.callback.Callback<List<Authenticator>, MfaException.MfaListAuthenticatorsException> {
                override fun onSuccess(result: List<Authenticator>) {
                    val array = WritableNativeArray()
                    for (authenticator in result) {
                        val map = WritableNativeMap().apply {
                            putString("id", authenticator.id)
                            putString("authenticatorType", authenticator.authenticatorType)
                            putBoolean("active", authenticator.active)
                            authenticator.name?.let { putString("name", it) }
                            authenticator.oobChannel?.let { putString("oobChannel", it) }
                        }
                        array.pushMap(map)
                    }
                    promise.resolve(array)
                }

                override fun onFailure(error: MfaException.MfaListAuthenticatorsException) {
                    promise.reject(error.getCode(), error.getDescription(), error)
                }
            }
        )
    }

    fun enroll(mfaToken: String, type: String, value: String?, promise: Promise) {
        val mfaClient = createAuthClient().mfaClient(mfaToken)

        val enrollmentType = when (type) {
            "phone" -> {
                if (value == null) {
                    promise.reject("MFA_ENROLLMENT_ERROR", "Phone number is required for phone enrollment")
                    return
                }
                MfaEnrollmentType.Phone(value)
            }
            "email" -> {
                if (value == null) {
                    promise.reject("MFA_ENROLLMENT_ERROR", "Email is required for email enrollment")
                    return
                }
                MfaEnrollmentType.Email(value)
            }
            "otp" -> MfaEnrollmentType.Otp
            "push" -> MfaEnrollmentType.Push
            else -> {
                promise.reject("MFA_ENROLLMENT_ERROR", "Unsupported enrollment type: $type")
                return
            }
        }

        mfaClient.enroll(enrollmentType).start(
            object : com.auth0.android.callback.Callback<EnrollmentChallenge, MfaException.MfaEnrollmentException> {
                override fun onSuccess(result: EnrollmentChallenge) {
                    val map = WritableNativeMap()
                    when (result) {
                        is TotpEnrollmentChallenge -> {
                            map.putString("type", "totp")
                            map.putString("barcodeUri", result.barcodeUri)
                            map.putString("secret", result.manualInputCode)
                        }
                        is OobEnrollmentChallenge -> {
                            map.putString("type", "oob")
                            map.putString("oobCode", result.oobCode)
                            result.bindingMethod?.let { map.putString("bindingMethod", it) }
                        }
                        is RecoveryCodeEnrollmentChallenge -> {
                            map.putString("type", "recovery-code")
                            map.putString("recoveryCode", result.recoveryCode)
                        }
                        else -> {
                            map.putString("type", "unknown")
                        }
                    }
                    promise.resolve(map)
                }

                override fun onFailure(error: MfaException.MfaEnrollmentException) {
                    promise.reject(error.getCode(), error.getDescription(), error)
                }
            }
        )
    }

    fun challenge(mfaToken: String, authenticatorId: String, promise: Promise) {
        val mfaClient = createAuthClient().mfaClient(mfaToken)

        mfaClient.challenge(authenticatorId).start(
            object : com.auth0.android.callback.Callback<com.auth0.android.result.Challenge, MfaException.MfaChallengeException> {
                override fun onSuccess(result: com.auth0.android.result.Challenge) {
                    val map = WritableNativeMap().apply {
                        putString("challengeType", result.challengeType)
                        result.oobCode?.let { putString("oobCode", it) }
                        result.bindingMethod?.let { putString("bindingMethod", it) }
                    }
                    promise.resolve(map)
                }

                override fun onFailure(error: MfaException.MfaChallengeException) {
                    promise.reject(error.getCode(), error.getDescription(), error)
                }
            }
        )
    }

    fun verify(mfaToken: String, type: String, code: String, bindingCode: String?, promise: Promise) {
        val mfaClient = createAuthClient().mfaClient(mfaToken)

        val verificationType = when (type) {
            "otp" -> MfaVerificationType.Otp(code)
            "oob" -> MfaVerificationType.Oob(oobCode = code, bindingCode = bindingCode)
            "recoveryCode" -> MfaVerificationType.RecoveryCode(code)
            else -> {
                promise.reject("MFA_VERIFY_ERROR", "Unsupported verification type: $type")
                return
            }
        }

        mfaClient.verify(verificationType).start(
            object : com.auth0.android.callback.Callback<Credentials, MfaException.MfaVerifyException> {
                override fun onSuccess(result: Credentials) {
                    val map = CredentialsParser.toMap(result)
                    promise.resolve(map)
                }

                override fun onFailure(error: MfaException.MfaVerifyException) {
                    promise.reject(error.getCode(), error.getDescription(), error)
                }
            }
        )
    }
}
