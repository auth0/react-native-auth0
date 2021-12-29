package com.auth0.react;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.browser.customtabs.CustomTabsIntent;

public class AuthenticationActivity extends Activity {

    static final int AUTHENTICATION_REQUEST = 1000;
    static final String EXTRA_AUTHORIZE_URI = "com.auth0.android.EXTRA_AUTHORIZE_URI";
    private static final String EXTRA_INTENT_LAUNCHED = "com.auth0.android.EXTRA_INTENT_LAUNCHED";

    private boolean intentLaunched;

    static void authenticateUsingBrowser(@NonNull Activity activity, @NonNull Uri authorizeUri) {
        Intent intent = new Intent(activity, AuthenticationActivity.class);
        intent.putExtra(AuthenticationActivity.EXTRA_AUTHORIZE_URI, authorizeUri);
        intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
        activity.startActivityForResult(intent, AUTHENTICATION_REQUEST);
    }

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (savedInstanceState != null) {
            intentLaunched = savedInstanceState.getBoolean(EXTRA_INTENT_LAUNCHED, false);
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        final Intent authenticationIntent = getIntent();

        if (!intentLaunched && authenticationIntent.getExtras() == null) {
            finish(); // Activity was launched in an unexpected way
            return;
        } else if (!intentLaunched) {
            intentLaunched = true;
            launchAuthenticationIntent();
            return;
        }

        boolean resultMissing = authenticationIntent.getData() == null;
        if (resultMissing) setResult(RESULT_CANCELED);
        else setResult(RESULT_OK, authenticationIntent);
        finish();
    }

    @Override
    protected void onSaveInstanceState(@NonNull Bundle outState) {
        super.onSaveInstanceState(outState);
        outState.putBoolean(EXTRA_INTENT_LAUNCHED, intentLaunched);
    }

    @Override
    protected void onNewIntent(@Nullable Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
    }

    private void launchAuthenticationIntent() {
        Bundle extras = getIntent().getExtras();
        Uri authorizeUri = extras.getParcelable(EXTRA_AUTHORIZE_URI);
        CustomTabsIntent.Builder builder = new CustomTabsIntent.Builder();
        CustomTabsIntent customTabsIntent = builder.build();
        customTabsIntent.launchUrl(this, authorizeUri);
    }

}
