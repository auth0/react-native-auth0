package com.auth0.react

import android.content.Context

/**
 * Tracks whether an interactive Universal Login is in flight across a possible Android
 * process death, so a later cold start can tell a genuine recovery scenario apart from a
 * normal launch.
 *
 * The recovered credentials themselves are buffered by `WebAuthProvider` (it holds a result
 * that completed via the state-restore path until the first `addCallback` subscriber is
 * registered), so this SDK only needs the in-progress marker. It is persisted because the
 * process may be killed before any result arrives.
 */
internal object WebAuthRecovery {

    private const val PREFS_NAME = "com.auth0.react.webauth_recovery"
    private const val KEY_FLOW_IN_PROGRESS = "flow_in_progress"

    /**
     * Records that an interactive login was started. Persisted so it survives the process
     * death that can occur while the browser is foregrounded.
     */
    fun markFlowInProgress(context: Context) {
        prefs(context).edit().putBoolean(KEY_FLOW_IN_PROGRESS, true).apply()
    }

    /**
     * Clears the in-progress marker once a flow reaches any terminal outcome (success,
     * failure, or cancellation), so it doesn't masquerade as a pending recovery next launch.
     */
    fun clearFlowInProgress(context: Context) {
        prefs(context).edit().putBoolean(KEY_FLOW_IN_PROGRESS, false).apply()
    }

    fun isFlowInProgress(context: Context): Boolean {
        return prefs(context).getBoolean(KEY_FLOW_IN_PROGRESS, false)
    }

    private fun prefs(context: Context) =
        context.applicationContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
}
