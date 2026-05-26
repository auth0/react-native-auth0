package com.auth0example

import android.app.Activity
import android.os.Build
import androidx.credentials.CreatePublicKeyCredentialRequest
import androidx.credentials.CreatePublicKeyCredentialResponse
import androidx.credentials.CredentialManager
import androidx.credentials.GetCredentialRequest
import androidx.credentials.GetPublicKeyCredentialOption
import androidx.credentials.PublicKeyCredential
import androidx.credentials.exceptions.CreateCredentialCancellationException
import androidx.credentials.exceptions.GetCredentialCancellationException
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class PasskeyModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "PasskeyModule"

    @ReactMethod
    fun createPasskey(requestJson: String, promise: Promise) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.P) {
            promise.reject("PASSKEY_NOT_AVAILABLE", "Passkeys require Android API 28 or later")
            return
        }

        val activity: Activity = reactApplicationContext.currentActivity
            ?: run {
                promise.reject("PASSKEY_FAILED", "No activity available")
                return
            }

        val credentialManager = CredentialManager.create(reactApplicationContext)
        val createRequest = CreatePublicKeyCredentialRequest(requestJson = requestJson)

        CoroutineScope(Dispatchers.Main).launch {
            try {
                val result = credentialManager.createCredential(activity, createRequest)
                val response = result as CreatePublicKeyCredentialResponse
                promise.resolve(response.registrationResponseJson)
            } catch (e: CreateCredentialCancellationException) {
                promise.reject("USER_CANCELLED", "User cancelled passkey creation", e)
            } catch (e: Exception) {
                promise.reject("PASSKEY_FAILED", e.message, e)
            }
        }
    }

    @ReactMethod
    fun getPasskey(requestJson: String, promise: Promise) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.P) {
            promise.reject("PASSKEY_NOT_AVAILABLE", "Passkeys require Android API 28 or later")
            return
        }

        val activity: Activity = reactApplicationContext.currentActivity
            ?: run {
                promise.reject("PASSKEY_FAILED", "No activity available")
                return
            }

        val credentialManager = CredentialManager.create(reactApplicationContext)
        val getRequest = GetCredentialRequest(
            listOf(GetPublicKeyCredentialOption(requestJson = requestJson))
        )

        CoroutineScope(Dispatchers.Main).launch {
            try {
                val result = credentialManager.getCredential(activity, getRequest)
                val credential = result.credential as PublicKeyCredential
                promise.resolve(credential.authenticationResponseJson)
            } catch (e: GetCredentialCancellationException) {
                promise.reject("USER_CANCELLED", "User cancelled passkey assertion", e)
            } catch (e: Exception) {
                promise.reject("PASSKEY_FAILED", e.message, e)
            }
        }
    }
}
