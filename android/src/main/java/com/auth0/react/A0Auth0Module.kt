package com.auth0.react

import android.app.Activity
import android.content.Intent
import androidx.fragment.app.FragmentActivity
import com.auth0.android.Auth0
import com.auth0.android.authentication.AuthenticationException
import com.auth0.android.authentication.storage.CredentialsManagerException
import com.auth0.android.authentication.storage.LocalAuthenticationOptions
import com.auth0.android.authentication.storage.SecureCredentialsManager
import com.auth0.android.authentication.storage.SharedPreferencesStorage
import com.auth0.android.provider.WebAuthProvider
import com.auth0.android.result.Credentials
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.UiThreadUtil
import java.net.MalformedURLException
import java.net.URL

class A0Auth0Module(private val reactContext: ReactApplicationContext) : A0Auth0Spec(reactContext), ActivityEventListener {

    companion object {
        const val NAME = "A0Auth0"
        const val UNKNOWN_ERROR_RESULT_CODE = 1405
        private const val INVALID_DOMAIN_URL_ERROR_CODE = "a0.invalid_domain_url"
        private const val BIOMETRICS_AUTHENTICATION_ERROR_CODE = "a0.invalid_options_biometrics_authentication"
        private const val LOCAL_AUTH_REQUEST_CODE = 150
    }

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
        promise: Promise
    ) {
        auth0 = Auth0.getInstance(clientId, domain)
        
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
                        promise.reject(e.code, e.message, e)
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
            promise.reject(e.code, e.message, e)
        }
    }

    @ReactMethod
    override fun clearCredentials(promise: Promise) {
        secureCredentialsManager.clearCredentials()
        promise.resolve(true)
    }

    @ReactMethod
    override fun hasValidCredentials(minTtl: Double, promise: Promise) {
        promise.resolve(secureCredentialsManager.hasValidCredentials(minTtl.toLong()))
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