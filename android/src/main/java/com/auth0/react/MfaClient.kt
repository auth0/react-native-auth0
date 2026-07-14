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

enum class MfaFactorType(val value: String) {
    PHONE("phone"),
    EMAIL("email"),
    OTP("otp"),
    PUSH("push"),
    VOICE("voice");

    companion object {
        fun fromString(type: String): MfaFactorType? =
            entries.find { it.value == type }
    }
}

enum class MfaVerifyType(val value: String) {
    OTP("otp"),
    OOB("oob"),
    RECOVERY_CODE("recoveryCode");

    companion object {
        fun fromString(type: String): MfaVerifyType? =
            entries.find { it.value == type }
    }
}

class MfaClient(
    private val auth0: Auth0,
    private val useDPoP: Boolean,
    private val reactContext: ReactApplicationContext
) {

    private val client: AuthenticationAPIClient by lazy {
        AuthenticationAPIClient(auth0).apply {
            if (useDPoP) {
                useDPoP(reactContext)
            }
        }
    }

    // Maps the public MfaFactorType vocabulary (otp/sms/voice/email/push) onto
    // the `Authenticator.type` tokens Auth0.Android 3.21.0 filters against with
    // exact, case-sensitive equality. Note: sms and voice both surface as the
    // `phone` type, so neither can be isolated here (narrowed later by oobChannel);
    // otp maps to both `otp` and `totp`. `recovery-code` is listable but not
    // enrollable, so it maps through here yet is absent from the enum.
    private fun mapFactorType(factor: String): List<String> {
        return when (factor.lowercase()) {
            "otp" -> listOf("otp", "totp")
            "sms", "voice" -> listOf("phone")
            "email" -> listOf("email")
            "push" -> listOf("push-notification")
            "recovery-code" -> listOf("recovery-code")
            else -> emptyList()
        }
    }

    fun getAuthenticators(mfaToken: String, factorsAllowed: ReadableArray?, promise: Promise) {
        val mfaClient = client.mfaClient(mfaToken)

        val requested = mutableListOf<String>()
        factorsAllowed?.let {
            for (i in 0 until it.size()) {
                it.getString(i)?.let { factor -> requested.add(factor.lowercase()) }
            }
        }
        val factors = requested.flatMap { mapFactorType(it) }.toMutableList()

        // Auth0.Android 3.21.0 rejects an empty factorsAllowed list, so default to
        // every recognized `Authenticator.type` token to match iOS/web "return all"
        // behaviour.
        if (factors.isEmpty()) {
            factors.addAll(
                listOf(
                    "otp",
                    "totp",
                    "phone",
                    "email",
                    "push-notification",
                    "recovery-code"
                )
            )
        }

        // Auth0.Android filters only on `Authenticator.type`, where sms and voice
        // both surface as "phone" — so an sms-only (or voice-only) request still
        // returns the other channel. Narrow phone-type results by oobChannel when
        // the caller asked for one but not both. Empty set = no narrowing (covers
        // the return-all default and requests that don't mention sms/voice).
        val wantedPhoneChannels = mutableSetOf<String>()
        if (requested.contains("sms")) wantedPhoneChannels.add("sms")
        if (requested.contains("voice")) wantedPhoneChannels.add("voice")
        val narrowPhoneChannels = wantedPhoneChannels.size == 1

        mfaClient.getAuthenticators(factors).start(
            object : com.auth0.android.callback.Callback<List<Authenticator>, MfaException.MfaListAuthenticatorsException> {
                override fun onSuccess(result: List<Authenticator>) {
                    val array = WritableNativeArray()
                    for (authenticator in result) {
                        // Drop the phone channel the caller didn't ask for.
                        if (narrowPhoneChannels && authenticator.type == "phone") {
                            val channel = authenticator.oobChannel
                            if (channel == null || !wantedPhoneChannels.contains(channel)) {
                                continue
                            }
                        }
                        val map = WritableNativeMap().apply {
                            putString("id", authenticator.id)
                            putString("type", authenticator.type)
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
        val mfaClient = client.mfaClient(mfaToken)

        val factorType = MfaFactorType.fromString(type)
        if (factorType == null) {
            promise.reject("MFA_ENROLLMENT_ERROR", "Unsupported enrollment type: $type")
            return
        }

        val enrollmentType = when (factorType) {
            MfaFactorType.PHONE -> {
                if (value == null) {
                    promise.reject("MFA_ENROLLMENT_ERROR", "Phone number is required for phone enrollment")
                    return
                }
                MfaEnrollmentType.Phone(value)
            }
            MfaFactorType.EMAIL -> {
                if (value == null) {
                    promise.reject("MFA_ENROLLMENT_ERROR", "Email is required for email enrollment")
                    return
                }
                MfaEnrollmentType.Email(value)
            }
            MfaFactorType.OTP -> MfaEnrollmentType.Otp
            MfaFactorType.PUSH -> MfaEnrollmentType.Push
            MfaFactorType.VOICE -> {
                if (value == null) {
                    promise.reject("MFA_ENROLLMENT_ERROR", "Phone number is required for voice enrollment")
                    return
                }
                MfaEnrollmentType.Phone(value)
            }
        }

        mfaClient.enroll(enrollmentType).start(
            object : com.auth0.android.callback.Callback<EnrollmentChallenge, MfaException.MfaEnrollmentException> {
                override fun onSuccess(result: EnrollmentChallenge) {
                    val map = WritableNativeMap()
                    when (result) {
                        is TotpEnrollmentChallenge -> {
                            // Push (Guardian) enrollment is deserialized by the SDK as a
                            // TOTP challenge because the response carries barcode_uri.
                            // Disambiguate using the requested factor type so the JS layer
                            // receives a dedicated push challenge with the pairing QR.
                            if (factorType == MfaFactorType.PUSH) {
                                map.putString("type", "push")
                                map.putString("barcodeUri", result.barcodeUri)
                            } else {
                                map.putString("type", "totp")
                                map.putString("barcodeUri", result.barcodeUri)
                                // Auth0.Android 3.21.0: /mfa/associate returns the
                                // manual-entry key in `secret` (manualInputCode is null
                                // on that endpoint).
                                map.putString("secret", result.secret)
                                result.recoveryCodes?.let {
                                    val codes = WritableNativeArray()
                                    for (code in it) codes.pushString(code)
                                    map.putArray("recoveryCodes", codes)
                                }
                            }
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
        val mfaClient = client.mfaClient(mfaToken)

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

    fun verify(mfaToken: String, type: String, code: String, bindingCode: String?, scope: String?, audience: String?, promise: Promise) {
        val verifyType = MfaVerifyType.fromString(type)
        if (verifyType == null) {
            promise.reject("MFA_VERIFY_ERROR", "Unsupported verification type: $type")
            return
        }

        val mfaClient = client.mfaClient(mfaToken)

        val verificationType = when (verifyType) {
            MfaVerifyType.OTP -> MfaVerificationType.Otp(code)
            MfaVerifyType.OOB -> MfaVerificationType.Oob(oobCode = code, bindingCode = bindingCode)
            MfaVerifyType.RECOVERY_CODE -> MfaVerificationType.RecoveryCode(code)
        }

        val verifyRequest = mfaClient.verify(verificationType)
        scope?.let { verifyRequest.addParameter("scope", it) }
        audience?.let { verifyRequest.addParameter("audience", it) }

        verifyRequest.start(
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
