package com.auth0.react

import com.auth0.android.Auth0
import com.auth0.android.myaccount.AuthenticationMethodType
import com.auth0.android.myaccount.MyAccountAPIClient
import com.auth0.android.myaccount.MyAccountException
import com.auth0.android.myaccount.PhoneAuthenticationMethodType
import com.auth0.android.myaccount.request.GetUserProfileOptions
import com.auth0.android.myaccount.request.UpdateUserProfileRequest
import com.auth0.android.request.PublicKeyCredentials
import com.auth0.android.result.AuthenticationMethod
import com.auth0.android.result.AuthenticatorSelection
import com.auth0.android.result.AuthnParamsPublicKey
import com.auth0.android.result.EnrollmentChallenge
import com.auth0.android.result.Factor
import com.auth0.android.result.MfaEnrollmentChallenge
import com.auth0.android.result.MyAccountProfile
import com.auth0.android.result.OobEnrollmentChallenge
import com.auth0.android.result.PasskeyAuthenticationMethod
import com.auth0.android.result.PasskeyEnrollmentChallenge
import com.auth0.android.result.PasskeyUser
import com.auth0.android.result.RecoveryCodeEnrollmentChallenge
import com.auth0.android.result.RelyingParty
import com.auth0.android.result.TotpEnrollmentChallenge
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.WritableNativeArray
import com.facebook.react.bridge.WritableNativeMap
import com.google.gson.Gson

class MyAccount(
    private val auth0: Auth0,
    private val useDPoP: Boolean,
    private val reactContext: ReactApplicationContext
) {

    private fun createClient(accessToken: String): MyAccountAPIClient {
        val client = MyAccountAPIClient(auth0, accessToken)
        if (useDPoP) {
            client.useDPoP(reactContext)
        }
        return client
    }

    private fun rejectWithMyAccountError(promise: Promise, error: MyAccountException) {
        val code = error.type ?: "MY_ACCOUNT_ERROR"
        val info = mutableMapOf<String, Any?>(
            "type" to error.type,
            "title" to error.title,
            "detail" to error.detail,
            "statusCode" to error.statusCode
        )
        error.validationErrors?.let { errors ->
            info["validationErrors"] = errors.map {
                mapOf(
                    "detail" to it.detail,
                    "field" to it.field,
                    "pointer" to it.pointer,
                    "source" to it.source
                )
            }
        }
        // Gson omits null values, so absent validation error fields stay undefined in JS.
        val message = Gson().toJson(info)
        promise.reject(code, message, error)
    }

    fun passkeyEnrollmentChallenge(
        accessToken: String,
        userIdentity: String?,
        connection: String?,
        promise: Promise
    ) {
        val myAccountClient = createClient(accessToken)

        val finalUserIdentity = userIdentity?.trim()?.ifEmpty { null }
        val finalConnection = connection?.trim()?.ifEmpty { null }

        myAccountClient.passkeyEnrollmentChallenge(finalUserIdentity, finalConnection)
            .start(object : com.auth0.android.callback.Callback<PasskeyEnrollmentChallenge, MyAccountException> {
                override fun onSuccess(challenge: PasskeyEnrollmentChallenge) {
                    val result = WritableNativeMap().apply {
                        putString("authenticationMethodId", challenge.authenticationMethodId)
                        putString("authSession", challenge.authSession)
                        val authParamsJson = Gson().toJson(challenge.authParamsPublicKey)
                        putMap("authParamsPublicKey", JsonUtils.jsonToWritableMap(authParamsJson))
                    }
                    promise.resolve(result)
                }

                override fun onFailure(error: MyAccountException) {
                    rejectWithMyAccountError(promise, error)
                }
            })
    }

    fun enrollPasskey(
        accessToken: String,
        authenticationMethodId: String,
        authSession: String,
        authResponse: String,
        authParamsPublicKey: String,
        promise: Promise
    ) {
        val myAccountClient = createClient(accessToken)

        val publicKeyCredentials = try {
            Gson().fromJson(authResponse, PublicKeyCredentials::class.java)
        } catch (e: Exception) {
            promise.reject("MY_ACCOUNT_ERROR", "Invalid authResponse JSON: ${e.message}", e)
            return
        }

        val authParams = try {
            Gson().fromJson(authParamsPublicKey, AuthnParamsPublicKey::class.java)
        } catch (e: Exception) {
            promise.reject("MY_ACCOUNT_ERROR", "Invalid authParamsPublicKey JSON: ${e.message}", e)
            return
        }
        val challenge = PasskeyEnrollmentChallenge(authenticationMethodId, authSession, authParams)

        myAccountClient.enroll(publicKeyCredentials, challenge)
            .start(object : com.auth0.android.callback.Callback<PasskeyAuthenticationMethod, MyAccountException> {
                override fun onSuccess(method: PasskeyAuthenticationMethod) {
                    val result = WritableNativeMap().apply {
                        putString("id", method.id)
                        putString("type", method.type)
                        putString("userIdentityId", method.identityUserId)
                        putString("userAgent", method.userAgent)
                        putString("keyId", method.keyId)
                        putString("publicKey", method.publicKey)
                        putString("userHandle", method.userHandle)
                        putString("credentialDeviceType", method.credentialDeviceType)
                        putBoolean("credentialBackedUp", method.credentialBackedUp ?: false)
                        putString("createdAt", method.createdAt)
                        putString("aaguid", method.aaguid)
                        putString("relyingPartyId", method.relyingPartyId)
                    }
                    promise.resolve(result)
                }

                override fun onFailure(error: MyAccountException) {
                    rejectWithMyAccountError(promise, error)
                }
            })
    }

    fun getAuthenticationMethods(
        accessToken: String,
        type: String?,
        promise: Promise
    ) {
        val myAccountClient = createClient(accessToken)

        val methodType = if (!type.isNullOrEmpty()) {
            parseAuthenticationMethodType(type) ?: run {
                promise.reject("MY_ACCOUNT_ERROR", "Invalid authentication method type: $type", null)
                return
            }
        } else null

        myAccountClient.getAuthenticationMethods(methodType)
            .start(object : com.auth0.android.callback.Callback<List<AuthenticationMethod>, MyAccountException> {
                override fun onSuccess(methods: List<AuthenticationMethod>) {
                    val result = WritableNativeArray()
                    for (method in methods) {
                        val json = Gson().toJson(method)
                        result.pushMap(JsonUtils.jsonToWritableMap(json))
                    }
                    promise.resolve(result)
                }

                override fun onFailure(error: MyAccountException) {
                    rejectWithMyAccountError(promise, error)
                }
            })
    }

    fun getAuthenticationMethodById(
        accessToken: String,
        id: String,
        promise: Promise
    ) {
        val myAccountClient = createClient(accessToken)

        myAccountClient.getAuthenticationMethodById(id)
            .start(object : com.auth0.android.callback.Callback<AuthenticationMethod, MyAccountException> {
                override fun onSuccess(method: AuthenticationMethod) {
                    val json = Gson().toJson(method)
                    promise.resolve(JsonUtils.jsonToWritableMap(json))
                }

                override fun onFailure(error: MyAccountException) {
                    rejectWithMyAccountError(promise, error)
                }
            })
    }

    fun updateAuthenticationMethodById(
        accessToken: String,
        id: String,
        name: String?,
        preferredAuthenticationMethod: String?,
        promise: Promise
    ) {
        val myAccountClient = createClient(accessToken)

        val nameValue = name?.ifEmpty { null }

        val phoneMethod = if (!preferredAuthenticationMethod.isNullOrEmpty()) {
            parsePhoneAuthenticationMethodType(preferredAuthenticationMethod) ?: run {
                promise.reject("MY_ACCOUNT_ERROR", "Invalid preferred authentication method: $preferredAuthenticationMethod", null)
                return
            }
        } else null

        myAccountClient.updateAuthenticationMethodById(id, nameValue, phoneMethod)
            .start(object : com.auth0.android.callback.Callback<AuthenticationMethod, MyAccountException> {
                override fun onSuccess(method: AuthenticationMethod) {
                    val json = Gson().toJson(method)
                    promise.resolve(JsonUtils.jsonToWritableMap(json))
                }

                override fun onFailure(error: MyAccountException) {
                    rejectWithMyAccountError(promise, error)
                }
            })
    }

    fun deleteAuthenticationMethodById(
        accessToken: String,
        id: String,
        promise: Promise
    ) {
        val myAccountClient = createClient(accessToken)

        myAccountClient.deleteAuthenticationMethod(id)
            .start(object : com.auth0.android.callback.Callback<Void?, MyAccountException> {
                override fun onSuccess(result: Void?) {
                    promise.resolve(null)
                }

                override fun onFailure(error: MyAccountException) {
                    rejectWithMyAccountError(promise, error)
                }
            })
    }

    fun enrollPhone(
        accessToken: String,
        phoneNumber: String,
        preferredAuthenticationMethod: String?,
        promise: Promise
    ) {
        val myAccountClient = createClient(accessToken)
        val preferredMethod = if (!preferredAuthenticationMethod.isNullOrEmpty()) {
            parsePhoneAuthenticationMethodType(preferredAuthenticationMethod) ?: run {
                promise.reject("MY_ACCOUNT_ENROLLMENT_FAILED", "Invalid preferred authentication method: $preferredAuthenticationMethod", null)
                return
            }
        } else PhoneAuthenticationMethodType.SMS

        myAccountClient.enrollPhone(phoneNumber, preferredMethod)
            .start(object : com.auth0.android.callback.Callback<EnrollmentChallenge, MyAccountException> {
                override fun onSuccess(challenge: EnrollmentChallenge) {
                    val result = WritableNativeMap().apply {
                        putString("id", challenge.id)
                        putString("authSession", challenge.authSession)
                    }
                    promise.resolve(result)
                }

                override fun onFailure(error: MyAccountException) {
                    rejectWithMyAccountError(promise, error)
                }
            })
    }

    fun enrollEmail(
        accessToken: String,
        emailAddress: String,
        promise: Promise
    ) {
        val myAccountClient = createClient(accessToken)

        myAccountClient.enrollEmail(emailAddress)
            .start(object : com.auth0.android.callback.Callback<EnrollmentChallenge, MyAccountException> {
                override fun onSuccess(challenge: EnrollmentChallenge) {
                    val result = WritableNativeMap().apply {
                        putString("id", challenge.id)
                        putString("authSession", challenge.authSession)
                    }
                    promise.resolve(result)
                }

                override fun onFailure(error: MyAccountException) {
                    rejectWithMyAccountError(promise, error)
                }
            })
    }

    fun enrollTOTP(
        accessToken: String,
        promise: Promise
    ) {
        val myAccountClient = createClient(accessToken)

        myAccountClient.enrollTotp()
            .start(object : com.auth0.android.callback.Callback<TotpEnrollmentChallenge, MyAccountException> {
                override fun onSuccess(challenge: TotpEnrollmentChallenge) {
                    val result = WritableNativeMap().apply {
                        challenge.id?.let { putString("id", it) }
                        challenge.authSession?.let { putString("authSession", it) }
                        putString("barcodeUri", challenge.barcodeUri)
                        challenge.manualInputCode?.let { putString("manualInputCode", it) }
                    }
                    promise.resolve(result)
                }

                override fun onFailure(error: MyAccountException) {
                    rejectWithMyAccountError(promise, error)
                }
            })
    }

    fun enrollPushNotification(
        accessToken: String,
        promise: Promise
    ) {
        val myAccountClient = createClient(accessToken)

        myAccountClient.enrollPushNotification()
            .start(object : com.auth0.android.callback.Callback<TotpEnrollmentChallenge, MyAccountException> {
                override fun onSuccess(challenge: TotpEnrollmentChallenge) {
                    val result = WritableNativeMap().apply {
                        challenge.id?.let { putString("id", it) }
                        challenge.authSession?.let { putString("authSession", it) }
                        putString("barcodeUri", challenge.barcodeUri)
                        challenge.manualInputCode?.let { putString("manualInputCode", it) }
                    }
                    promise.resolve(result)
                }

                override fun onFailure(error: MyAccountException) {
                    rejectWithMyAccountError(promise, error)
                }
            })
    }

    fun enrollRecoveryCode(
        accessToken: String,
        promise: Promise
    ) {
        val myAccountClient = createClient(accessToken)

        myAccountClient.enrollRecoveryCode()
            .start(object : com.auth0.android.callback.Callback<RecoveryCodeEnrollmentChallenge, MyAccountException> {
                override fun onSuccess(challenge: RecoveryCodeEnrollmentChallenge) {
                    val result = WritableNativeMap().apply {
                        putString("id", challenge.id)
                        putString("authSession", challenge.authSession)
                        putString("recoveryCode", challenge.recoveryCode)
                    }
                    promise.resolve(result)
                }

                override fun onFailure(error: MyAccountException) {
                    rejectWithMyAccountError(promise, error)
                }
            })
    }

    fun confirmEnrollmentWithOtp(
        accessToken: String,
        id: String,
        authSession: String,
        otpCode: String,
        promise: Promise
    ) {
        val myAccountClient = createClient(accessToken)

        myAccountClient.verifyOtp(id, otpCode, authSession)
            .start(object : com.auth0.android.callback.Callback<AuthenticationMethod, MyAccountException> {
                override fun onSuccess(method: AuthenticationMethod) {
                    val json = Gson().toJson(method)
                    promise.resolve(JsonUtils.jsonToWritableMap(json))
                }

                override fun onFailure(error: MyAccountException) {
                    rejectWithMyAccountError(promise, error)
                }
            })
    }

    fun confirmEnrollment(
        accessToken: String,
        id: String,
        authSession: String,
        promise: Promise
    ) {
        val myAccountClient = createClient(accessToken)

        myAccountClient.verify(id, authSession)
            .start(object : com.auth0.android.callback.Callback<AuthenticationMethod, MyAccountException> {
                override fun onSuccess(method: AuthenticationMethod) {
                    val json = Gson().toJson(method)
                    promise.resolve(JsonUtils.jsonToWritableMap(json))
                }

                override fun onFailure(error: MyAccountException) {
                    rejectWithMyAccountError(promise, error)
                }
            })
    }

    fun getFactors(
        accessToken: String,
        promise: Promise
    ) {
        val myAccountClient = createClient(accessToken)

        myAccountClient.getFactors()
            .start(object : com.auth0.android.callback.Callback<List<Factor>, MyAccountException> {
                override fun onSuccess(factors: List<Factor>) {
                    val result = WritableNativeArray()
                    for (factor in factors) {
                        val map = WritableNativeMap().apply {
                            putString("type", factor.type)
                            factor.usage?.let { usageList ->
                                val usageArray = WritableNativeArray()
                                usageList.forEach { usageArray.pushString(it) }
                                putArray("usage", usageArray)
                            }
                        }
                        result.pushMap(map)
                    }
                    promise.resolve(result)
                }

                override fun onFailure(error: MyAccountException) {
                    rejectWithMyAccountError(promise, error)
                }
            })
    }

    fun getUserProfile(
        accessToken: String,
        fields: List<String>,
        includeFields: Boolean,
        promise: Promise
    ) {
        val myAccountClient = createClient(accessToken)

        myAccountClient.getUserProfile(GetUserProfileOptions(fields, includeFields))
            .start(object : com.auth0.android.callback.Callback<MyAccountProfile, MyAccountException> {
                override fun onSuccess(profile: MyAccountProfile) {
                    promise.resolve(profileToMap(profile))
                }

                override fun onFailure(error: MyAccountException) {
                    rejectWithMyAccountError(promise, error)
                }
            })
    }

    fun updateUserProfile(
        accessToken: String,
        givenName: String?,
        familyName: String?,
        name: String?,
        nickname: String?,
        picture: String?,
        promise: Promise
    ) {
        val myAccountClient = createClient(accessToken)
        val request = UpdateUserProfileRequest(
            givenName = givenName,
            familyName = familyName,
            name = name,
            nickname = nickname,
            picture = picture
        )

        myAccountClient.updateUserProfile(request)
            .start(object : com.auth0.android.callback.Callback<MyAccountProfile, MyAccountException> {
                override fun onSuccess(profile: MyAccountProfile) {
                    promise.resolve(profileToMap(profile))
                }

                override fun onFailure(error: MyAccountException) {
                    rejectWithMyAccountError(promise, error)
                }
            })
    }

    private fun profileToMap(profile: MyAccountProfile): WritableNativeMap {
        return WritableNativeMap().apply {
            profile.userId?.let { putString("userId", it) }
            profile.givenName?.let { putString("givenName", it) }
            profile.familyName?.let { putString("familyName", it) }
            profile.name?.let { putString("name", it) }
            profile.nickname?.let { putString("nickname", it) }
            profile.picture?.let { putString("picture", it) }
            profile.email?.let { putString("email", it) }
            profile.emailVerified?.let { putBoolean("emailVerified", it) }
            profile.phoneNumber?.let { putString("phoneNumber", it) }
            profile.phoneVerified?.let { putBoolean("phoneVerified", it) }
            profile.username?.let { putString("username", it) }
            profile.createdAt?.let { putString("createdAt", it) }
            profile.updatedAt?.let { putString("updatedAt", it) }
            if (profile.profilePolicy.isNotEmpty()) {
                val policies = WritableNativeMap()
                profile.profilePolicy.forEach { (pointer, policy) ->
                    policies.putMap(pointer, WritableNativeMap().apply {
                        policy.access?.let { putString("access", it.value) }
                        policy.source?.let { putString("source", it.value) }
                        policy.reason?.let { putString("reason", it) }
                    })
                }
                putMap("profilePolicy", policies)
            }
        }
    }

    private fun parseAuthenticationMethodType(type: String): AuthenticationMethodType? {
        return when (type) {
            "passkey" -> AuthenticationMethodType.PASSKEY
            "phone" -> AuthenticationMethodType.PHONE
            "email" -> AuthenticationMethodType.EMAIL
            "totp" -> AuthenticationMethodType.TOTP
            "push-notification" -> AuthenticationMethodType.PUSH
            "recovery-code" -> AuthenticationMethodType.RECOVERY_CODE
            "webauthn-platform" -> AuthenticationMethodType.WEBAUTHN_PLATFORM
            "webauthn-roaming" -> AuthenticationMethodType.WEBAUTHN_ROAMING
            "password" -> AuthenticationMethodType.PASSWORD
            else -> null
        }
    }

    private fun parsePhoneAuthenticationMethodType(method: String): PhoneAuthenticationMethodType? {
        return when (method) {
            "sms" -> PhoneAuthenticationMethodType.SMS
            "voice" -> PhoneAuthenticationMethodType.VOICE
            else -> null
        }
    }
}
