package com.auth0.react

import android.app.Activity
import android.content.Intent
import androidx.fragment.app.FragmentActivity
import com.auth0.android.Auth0
import com.auth0.android.result.APICredentials
import com.auth0.android.authentication.AuthenticationAPIClient
import com.auth0.android.authentication.AuthenticationException
import com.auth0.android.authentication.storage.CredentialsManagerException
import com.auth0.android.authentication.storage.LocalAuthenticationOptions
import com.auth0.android.authentication.storage.SecureCredentialsManager
import com.auth0.android.authentication.storage.SharedPreferencesStorage
import com.auth0.android.dpop.DPoP
import com.auth0.android.dpop.DPoPException
import com.auth0.android.provider.WebAuthProvider
import com.auth0.android.result.Credentials
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.UiThreadUtil
import com.facebook.react.bridge.WritableNativeMap
import java.net.MalformedURLException
import java.net.URL

class A0Auth0Module(private val reactContext: ReactApplicationContext) : A0Auth0Spec(reactContext), ActivityEventListener {

    companion object {
        const val NAME = "A0Auth0"
        private const val CREDENTIAL_MANAGER_ERROR_CODE = "CREDENTIAL_MANAGER_ERROR"
        private const val BIOMETRICS_AUTHENTICATION_ERROR_CODE = "BIOMETRICS_CONFIGURATION_ERROR"
        
        // DPoP-specific error codes
        private const val DPOP_ERROR_CODE = "DPOP_ERROR"
        private const val DPOP_KEY_GENERATION_FAILED_CODE = "DPOP_KEY_GENERATION_FAILED"
        private const val DPOP_KEY_STORAGE_FAILED_CODE = "DPOP_KEY_STORAGE_FAILED"
        private const val DPOP_KEY_RETRIEVAL_FAILED_CODE = "DPOP_KEY_RETRIEVAL_FAILED"
        private const val DPOP_KEYSTORE_ERROR_CODE = "DPOP_KEYSTORE_ERROR"
        private const val DPOP_CRYPTO_ERROR_CODE = "DPOP_CRYPTO_ERROR"
        private const val DPOP_GENERATION_FAILED_CODE = "DPOP_GENERATION_FAILED"
        private const val DPOP_PROOF_FAILED_CODE = "DPOP_PROOF_FAILED"
        private const val DPOP_NONCE_MISMATCH_CODE = "DPOP_NONCE_MISMATCH"
        private const val DPOP_INVALID_TOKEN_TYPE_CODE = "DPOP_INVALID_TOKEN_TYPE"
        private const val DPOP_MISSING_PARAMETER_CODE = "DPOP_MISSING_PARAMETER"
        private const val DPOP_CLEAR_KEY_FAILED_CODE = "DPOP_CLEAR_KEY_FAILED"
    }

    private val errorCodeMap = mapOf(
        CredentialsManagerException.INVALID_CREDENTIALS to "INVALID_CREDENTIALS",
        CredentialsManagerException.NO_CREDENTIALS to "NO_CREDENTIALS",
        CredentialsManagerException.NO_REFRESH_TOKEN to "NO_REFRESH_TOKEN",
        CredentialsManagerException.RENEW_FAILED to "RENEW_FAILED",
        CredentialsManagerException.STORE_FAILED to "STORE_FAILED",
        CredentialsManagerException.REVOKE_FAILED to "REVOKE_FAILED",
        CredentialsManagerException.LARGE_MIN_TTL to "LARGE_MIN_TTL",
        CredentialsManagerException.INCOMPATIBLE_DEVICE to "INCOMPATIBLE_DEVICE",
        CredentialsManagerException.CRYPTO_EXCEPTION to "CRYPTO_EXCEPTION",
        CredentialsManagerException.BIOMETRIC_ERROR_NO_ACTIVITY to "BIOMETRIC_NO_ACTIVITY",
        CredentialsManagerException.BIOMETRIC_ERROR_STATUS_UNKNOWN to "BIOMETRIC_ERROR_STATUS_UNKNOWN",
        CredentialsManagerException.BIOMETRIC_ERROR_UNSUPPORTED to "BIOMETRIC_ERROR_UNSUPPORTED",
        CredentialsManagerException.BIOMETRIC_ERROR_HW_UNAVAILABLE to "BIOMETRIC_ERROR_HW_UNAVAILABLE",
        CredentialsManagerException.BIOMETRIC_ERROR_NONE_ENROLLED to "BIOMETRIC_ERROR_NONE_ENROLLED",
        CredentialsManagerException.BIOMETRIC_ERROR_NO_HARDWARE to "BIOMETRIC_ERROR_NO_HARDWARE",
        CredentialsManagerException.BIOMETRIC_ERROR_SECURITY_UPDATE_REQUIRED to "BIOMETRIC_ERROR_SECURITY_UPDATE_REQUIRED",
        CredentialsManagerException.BIOMETRIC_AUTHENTICATION_CHECK_FAILED to "BIOMETRIC_AUTHENTICATION_CHECK_FAILED",
        CredentialsManagerException.BIOMETRIC_ERROR_DEVICE_CREDENTIAL_NOT_AVAILABLE to "BIOMETRIC_ERROR_DEVICE_CREDENTIAL_NOT_AVAILABLE",
        CredentialsManagerException.BIOMETRIC_ERROR_STRONG_AND_DEVICE_CREDENTIAL_NOT_AVAILABLE to "BIOMETRIC_ERROR_STRONG_AND_DEVICE_CREDENTIAL_NOT_AVAILABLE",
        CredentialsManagerException.BIOMETRIC_ERROR_NO_DEVICE_CREDENTIAL to "BIOMETRIC_ERROR_NO_DEVICE_CREDENTIAL",
        CredentialsManagerException.BIOMETRIC_ERROR_NEGATIVE_BUTTON to "BIOMETRIC_ERROR_NEGATIVE_BUTTON",
        CredentialsManagerException.BIOMETRIC_ERROR_HW_NOT_PRESENT to "BIOMETRIC_ERROR_HW_NOT_PRESENT",
        CredentialsManagerException.BIOMETRIC_ERROR_NO_BIOMETRICS to "BIOMETRIC_ERROR_NO_BIOMETRICS",
        CredentialsManagerException.BIOMETRIC_ERROR_USER_CANCELED to "BIOMETRIC_ERROR_USER_CANCELED",
        CredentialsManagerException.BIOMETRIC_ERROR_LOCKOUT_PERMANENT to "BIOMETRIC_ERROR_LOCKOUT_PERMANENT",
        CredentialsManagerException.BIOMETRIC_ERROR_VENDOR to "BIOMETRIC_ERROR_VENDOR",
        CredentialsManagerException.BIOMETRIC_ERROR_LOCKOUT to "BIOMETRIC_ERROR_LOCKOUT",
        CredentialsManagerException.BIOMETRIC_ERROR_CANCELED to "BIOMETRIC_ERROR_CANCELED",
        CredentialsManagerException.BIOMETRIC_ERROR_NO_SPACE to "BIOMETRIC_ERROR_NO_SPACE",
        CredentialsManagerException.BIOMETRIC_ERROR_TIMEOUT to "BIOMETRIC_ERROR_TIMEOUT",
        CredentialsManagerException.BIOMETRIC_ERROR_UNABLE_TO_PROCESS to "BIOMETRIC_ERROR_UNABLE_TO_PROCESS",
        CredentialsManagerException.BIOMETRICS_INVALID_USER to "BIOMETRICS_INVALID_USER",
        CredentialsManagerException.BIOMETRIC_AUTHENTICATION_FAILED to "BIOMETRIC_AUTHENTICATION_FAILED",
        CredentialsManagerException.API_ERROR to "API_ERROR",
        CredentialsManagerException.NO_NETWORK to "NO_NETWORK"
    )
    // DPoP enabled by default
    private var useDPoP: Boolean = true

    private var auth0: Auth0? = null
    private lateinit var secureCredentialsManager: SecureCredentialsManager
    private var webAuthPromise: Promise? = null

    init {
        reactContext.addActivityEventListener(this)
    }

    @ReactMethod
    override fun webAuth(
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
    ) {
        if(this.useDPoP) {
            WebAuthProvider.useDPoP(reactContext)
        }
        webAuthPromise = promise
        val cleanedParameters = mutableMapOf<String, String>()
        
        additionalParameters?.let { params ->
            params.toHashMap().forEach { (key, value) ->
                value?.let { cleanedParameters[key] = it.toString() }
            }
        }

        val builder = WebAuthProvider.login(auth0!!).withScheme(scheme)
        
        builder.apply {
            state?.let { withState(it) }
            nonce?.let { withNonce(it) }
            audience?.let { withAudience(it) }
            scope?.let { withScope(it) }
            connection?.let { withConnection(it) }
            maxAge?.let { if (it.toInt() != 0) withMaxAge(it.toInt()) }
            organization?.let { withOrganization(it) }
            invitationUrl?.let { withInvitationUrl(it) }
            leeway?.let { if (it.toInt() != 0) withIdTokenVerificationLeeway(it.toInt()) }
            redirectUri?.let { withRedirectUri(it) }
        }
        
        builder.withParameters(cleanedParameters)
        builder.start(reactContext.currentActivity as Activity,
            object : com.auth0.android.callback.Callback<Credentials, AuthenticationException> {
                override fun onSuccess(result: Credentials) {
                    val map = CredentialsParser.toMap(result)
                    promise.resolve(map)
                    webAuthPromise = null
                }

                override fun onFailure(error: AuthenticationException) {
                    handleError(error, promise)
                    webAuthPromise = null
                }
            })
    }

    @ReactMethod
    override fun getBundleIdentifier(promise: Promise) {
        val packageName = reactContext.applicationInfo.packageName
        promise.resolve(packageName)
    }

    @ReactMethod
    override fun initializeAuth0WithConfiguration(
        clientId: String,
        domain: String,
        localAuthenticationOptions: ReadableMap?,
        useDPoP: Boolean?,
        promise: Promise
    ) {
        this.useDPoP = useDPoP ?: true
        auth0 = Auth0.getInstance(clientId, domain)

        val authAPI = AuthenticationAPIClient(auth0!!)
        if (this.useDPoP) {
            authAPI.useDPoP(reactContext)
        }
        
        localAuthenticationOptions?.let { options ->
            val activity = reactContext.currentActivity
            if (activity is FragmentActivity) {
                try {
                    val localAuthOptions = LocalAuthenticationOptionsParser.fromMap(options)
                    secureCredentialsManager = SecureCredentialsManager(
                        reactContext,
                        auth0!!,
                        SharedPreferencesStorage(reactContext),
                        activity,
                        localAuthOptions
                    )
                    promise.resolve(true)
                    return
                } catch (e: Exception) {
                    secureCredentialsManager = getSecureCredentialsManagerWithoutBiometrics()
                    promise.reject(
                        BIOMETRICS_AUTHENTICATION_ERROR_CODE,
                        "Failed to parse the Local Authentication Options, hence proceeding without Biometrics Authentication for handling Credentials"
                    )
                    return
                }
            } else {
                secureCredentialsManager = getSecureCredentialsManagerWithoutBiometrics()
                promise.reject(
                    BIOMETRICS_AUTHENTICATION_ERROR_CODE,
                    "Biometrics Authentication for Handling Credentials are supported only on FragmentActivity, since a different activity is supplied, proceeding without it"
                )
                return
            }
        }
        
        secureCredentialsManager = getSecureCredentialsManagerWithoutBiometrics()
        promise.resolve(true)
    }

    @ReactMethod
    override fun hasValidAuth0InstanceWithConfiguration(clientId: String, domain: String, promise: Promise) {
        if (auth0 == null) {
            promise.resolve(false)
            return
        }
        
        promise.resolve(auth0!!.clientId == clientId && auth0!!.domain == domain)
    }

    @ReactMethod
    override fun getCredentials(
        scope: String?,
        minTtl: Double,
        parameters: ReadableMap,
        forceRefresh: Boolean,
        promise: Promise
    ) {
        val cleanedParameters = mutableMapOf<String, String>()
        parameters.toHashMap().forEach { (key, value) ->
            value?.let { cleanedParameters[key] = it.toString() }
        }

        UiThreadUtil.runOnUiThread {
            secureCredentialsManager.getCredentials(
                scope,
                minTtl.toInt(),
                cleanedParameters,
                forceRefresh,
                object : com.auth0.android.callback.Callback<Credentials, CredentialsManagerException> {
                    override fun onSuccess(credentials: Credentials) {
                        val map = CredentialsParser.toMap(credentials)
                        promise.resolve(map)
                    }

                    override fun onFailure(e: CredentialsManagerException) {
                        val errorCode = deduceErrorCode(e)
                        promise.reject(errorCode, e.message, e)
                    }
                }
            )
        }
    }

    @ReactMethod
    override fun saveCredentials(credentials: ReadableMap, promise: Promise) {
        try {
            secureCredentialsManager.saveCredentials(CredentialsParser.fromMap(credentials))
            promise.resolve(true)
        } catch (e: CredentialsManagerException) {
            val errorCode = deduceErrorCode(e)
            promise.reject(errorCode, e.message, e)
        }
    }

    @ReactMethod
    override fun clearCredentials(promise: Promise) {
        secureCredentialsManager.clearCredentials()
        
        // Also clear DPoP key if DPoP is enabled
        if (useDPoP) {
            try {
                DPoP.clearKeyPair()
            } catch (e: Exception) {
                // Log error but don't fail the operation
                android.util.Log.w(NAME, "Failed to clear DPoP key", e)
            }
        }
        
        promise.resolve(true)
    }

    @ReactMethod
    override fun hasValidCredentials(minTtl: Double, promise: Promise) {
        promise.resolve(secureCredentialsManager.hasValidCredentials(minTtl.toLong()))
    }

    @ReactMethod
    override fun getApiCredentials(
        audience: String,
        scope: String?,
        minTtl: Double,
        parameters: ReadableMap,
        promise: Promise
    ) {
        val cleanedParameters = mutableMapOf<String, String>()
        parameters.toHashMap().forEach { (key, value) ->
            value?.let { cleanedParameters[key] = it.toString() }
        }

        UiThreadUtil.runOnUiThread {
            secureCredentialsManager.getApiCredentials(
                audience,
                scope,
                minTtl.toInt(),
                cleanedParameters,
                emptyMap(), // headers not supported from JS yet
                object : com.auth0.android.callback.Callback<APICredentials, CredentialsManagerException> {
                    override fun onSuccess(credentials: APICredentials) {
                        val map = ApiCredentialsParser.toMap(credentials)
                        promise.resolve(map)
                    }

                    override fun onFailure(e: CredentialsManagerException) {
                        val errorCode = deduceErrorCode(e)
                        promise.reject(errorCode, e.message, e)
                    }
                }
            )
        }
    }

    @ReactMethod
    override fun clearApiCredentials(audience: String, promise: Promise) {
        secureCredentialsManager.clearApiCredentials(audience)
        promise.resolve(true)
    }
    override fun getConstants(): Map<String, String> {
        return mapOf("bundleIdentifier" to reactContext.applicationInfo.packageName)
    }

    override fun getName(): String = NAME

    @ReactMethod
    override fun webAuthLogout(scheme: String, federated: Boolean, redirectUri: String?, promise: Promise) {
        val builder = WebAuthProvider.logout(auth0!!).withScheme(scheme)
        
        if (federated) {
            builder.withFederated()
        }
        
        redirectUri?.let { builder.withReturnToUrl(it) }
        
        builder.start(reactContext.currentActivity as FragmentActivity,
            object : com.auth0.android.callback.Callback<Void?, AuthenticationException> {
                override fun onSuccess(result: Void?) {
                    promise.resolve(true)
                }

                override fun onFailure(e: AuthenticationException) {
                    handleError(e, promise)
                }
            })
    }

    @ReactMethod
    override fun getDPoPHeaders(url: String, method: String, accessToken: String, tokenType: String, nonce: String?, promise: Promise) {
        try {
            // Validate parameters
            if (url.isEmpty()) {
                promise.reject(
                    DPOP_MISSING_PARAMETER_CODE,
                    "URL parameter is required for DPoP header generation"
                )
                return
            }

            if (method.isEmpty()) {
                promise.reject(
                    DPOP_MISSING_PARAMETER_CODE,
                    "HTTP method parameter is required for DPoP header generation"
                )
                return
            }

            if (accessToken.isEmpty()) {
                promise.reject(
                    DPOP_MISSING_PARAMETER_CODE,
                    "Access token parameter is required for DPoP header generation"
                )
                return
            }

            // Check if token type is DPoP
            if (!tokenType.equals("DPoP", ignoreCase = true)) {
                // If not DPoP, return Bearer token format
                val headers = WritableNativeMap()
                headers.putString("Authorization", "Bearer $accessToken")
                promise.resolve(headers)
                return
            }

            val headerData = if (nonce != null && nonce.isNotEmpty()) {
                DPoP.getHeaderData(method, url, accessToken, tokenType, nonce)
            } else {
                DPoP.getHeaderData(method, url, accessToken, tokenType)
            }
            val map = WritableNativeMap()
            map.putString("Authorization", headerData.authorizationHeader)
            headerData.dpopProof?.let { map.putString("DPoP", it) }
            promise.resolve(map)
        } catch (e: DPoPException) {
            handleDPoPError(e, promise)
        } catch (e: Exception) {
            promise.reject(
                DPOP_GENERATION_FAILED_CODE,
                "Failed to generate DPoP headers: ${e.message}",
                e
            )
        }
    }

    @ReactMethod
    override fun clearDPoPKey(promise: Promise) {
        try {
            DPoP.clearKeyPair()
            promise.resolve(null)
        } catch (e: DPoPException) {
            handleDPoPError(e, promise)
        } catch (e: Exception) {
            promise.reject(
                DPOP_CLEAR_KEY_FAILED_CODE,
                "Failed to clear DPoP key: ${e.message}",
                e
            )
        }
    }

    override fun onActivityResult(activity: Activity, requestCode: Int, resultCode: Int, data: Intent?) {
        // No-op
    }

    override fun onNewIntent(intent: Intent) {
        webAuthPromise?.let { promise ->
            promise.reject(
                "a0.session.browser_terminated",
                "The browser window was closed by a new instance of the application"
            )
            webAuthPromise = null
        }
    }

    override fun resumeWebAuth(url: String, promise: Promise) {
        // dummy function implementation, as this is only needed in iOS
        promise.resolve(true)
    }

    override fun cancelWebAuth(promise: Promise) {
        // dummy function implementation, as this is only needed in iOS
        promise.resolve(true)
    }

    private fun getSecureCredentialsManagerWithoutBiometrics(): SecureCredentialsManager {
        return SecureCredentialsManager(
            reactContext,
            auth0!!,
            SharedPreferencesStorage(reactContext)
        )
    }

    private fun deduceErrorCode(e: CredentialsManagerException): String {
        return errorCodeMap[e] ?: CREDENTIAL_MANAGER_ERROR_CODE
    }

    private fun handleDPoPError(error: DPoPException, promise: Promise) {
        val errorCode = when (error) {
            DPoPException.KEY_GENERATION_ERROR -> DPOP_KEY_GENERATION_FAILED_CODE
            DPoPException.KEY_STORE_ERROR -> DPOP_KEYSTORE_ERROR_CODE
            DPoPException.KEY_PAIR_NOT_FOUND -> DPOP_KEY_RETRIEVAL_FAILED_CODE
            DPoPException.SIGNING_ERROR -> DPOP_PROOF_FAILED_CODE
            DPoPException.MALFORMED_URL -> DPOP_MISSING_PARAMETER_CODE
            DPoPException.UNSUPPORTED_ERROR -> DPOP_ERROR_CODE
            DPoPException.UNKNOWN_ERROR -> DPOP_GENERATION_FAILED_CODE
            else -> DPOP_GENERATION_FAILED_CODE
        }
        
        promise.reject(errorCode, error.message ?: "DPoP operation failed", error)
    }

    private fun handleError(error: AuthenticationException, promise: Promise) {
        when {
            error.isBrowserAppNotAvailable -> {
                promise.reject("a0.browser_not_available", "No Browser application is installed.", error)
                return
            }
            error.isCanceled -> {
                promise.reject("a0.session.user_cancelled", "User cancelled the Auth", error)
                return
            }
            error.isNetworkError -> {
                promise.reject("a0.network_error", "Network error", error)
                return
            }
            error.isIdTokenValidationError -> {
                promise.reject("a0.session.invalid_idtoken", "Error validating ID Token", error)
                return
            }
        }
        
        val separator = if (error.message?.endsWith(".") == true) "" else "."
        promise.reject(
            error.getCode(),
            "${error.message}$separator CAUSE: ${error.getDescription()}",
            error
        )
    }
}
