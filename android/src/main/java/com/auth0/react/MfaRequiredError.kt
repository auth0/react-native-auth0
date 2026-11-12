package com.auth0.react

import com.auth0.android.result.MfaRequiredErrorPayload
import com.facebook.react.bridge.Promise
import com.google.gson.Gson

/**
 * Rejects with `mfa_required` and the response body, which holds the `mfa_token` the app needs to continue.
 * Returns false, without rejecting, when MFA isn't what's required.
 */
internal fun Promise.rejectIfMultifactorRequired(payload: MfaRequiredErrorPayload?, cause: Throwable): Boolean {
    payload ?: return false
    reject(payload.error, payload.errorDescription, cause, JsonUtils.jsonToWritableMap(Gson().toJson(payload)))
    return true
}
