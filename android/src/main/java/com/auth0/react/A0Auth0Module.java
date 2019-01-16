
package com.auth0.react;

import android.app.Activity;
import android.app.PendingIntent;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Handler;
import android.support.annotation.NonNull;
import android.support.customtabs.CustomTabsIntent;
import android.util.Base64;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;

import java.io.UnsupportedEncodingException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


public class A0Auth0Module extends ReactContextBaseJavaModule implements LifecycleEventListener {

    private static final String US_ASCII = "US-ASCII";
    private static final String SHA_256 = "SHA-256";
    private static final int CANCEL_EVENT_DELAY = 100;
    private static final String ACTION_CUSTOM_TABS_CONNECTION = "android.support.customtabs.action.CustomTabsService";
    //Known Browsers with Custom Tabs support
    private static final String CHROME_STABLE = "com.android.chrome";
    private static final String CHROME_SYSTEM = "com.google.android.apps.chrome";
    private static final String CHROME_BETA = "com.android.chrome.beta";
    private static final String CHROME_DEV = "com.android.chrome.dev";

    private final ReactApplicationContext reactContext;
    private Callback callback;

    public A0Auth0Module(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        this.reactContext.addLifecycleEventListener(this);
    }

    @Override
    public String getName() {
        return "A0Auth0";
    }

    @Override
    public Map<String, Object> getConstants() {
        final Map<String, Object> constants = new HashMap<>();
        constants.put("bundleIdentifier", reactContext.getApplicationInfo().packageName);
        return constants;
    }

    @ReactMethod
    public void showUrl(String url, boolean closeOnLoad, Callback callback) {
        final Activity activity = getCurrentActivity();
        this.callback = callback;
        if (activity != null) {
            String browserPackage = getBestBrowserPackage(activity);

            CustomTabsIntent.Builder builder = new CustomTabsIntent.Builder();
            CustomTabsIntent customTabsIntent = builder.build();
            if(browserPackage != null) {
                customTabsIntent.intent.setPackage(browserPackage);
            }
            customTabsIntent.launchUrl(activity, Uri.parse(url));
        } else {
            final Intent intent = new Intent(Intent.ACTION_VIEW);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            intent.setData(Uri.parse(url));
            getReactApplicationContext().startActivity(intent);
        }
    }

    @ReactMethod
    public void oauthParameters(Callback callback) {
        final String verifier = this.generateRandomValue();
        final WritableMap parameters = Arguments.createMap();
        parameters.putString("verifier", verifier);
        parameters.putString("code_challenge", this.generateCodeChallenge(verifier));
        parameters.putString("code_challenge_method", "S256");
        parameters.putString("state", this.generateRandomValue());
        callback.invoke(parameters);
    }

    @ReactMethod
    public void hide() {
        // NO OP
    }

    private String getBase64String(byte[] source) {
        return Base64.encodeToString(source, Base64.URL_SAFE | Base64.NO_WRAP | Base64.NO_PADDING);
    }

    byte[] getASCIIBytes(String value) {
        byte[] input;
        try {
            input = value.getBytes(US_ASCII);
        } catch (UnsupportedEncodingException e) {
            throw new IllegalStateException("Could not convert string to an ASCII byte array", e);
        }
        return input;
    }

    byte[] getSHA256(byte[] input) {
        byte[] signature;
        try {
            MessageDigest md = MessageDigest.getInstance(SHA_256);
            md.update(input, 0, input.length);
            signature = md.digest();
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("Failed to get SHA-256 signature", e);
        }
        return signature;
    }

    String generateRandomValue() {
        SecureRandom sr = new SecureRandom();
        byte[] code = new byte[32];
        sr.nextBytes(code);
        return this.getBase64String(code);
    }

    String generateCodeChallenge(@NonNull String codeVerifier) {
        byte[] input = getASCIIBytes(codeVerifier);
        byte[] signature = getSHA256(input);
        return getBase64String(signature);
    }

    @Override
    public void onHostResume() {
        new Handler().postDelayed(new Runnable() {
            @Override
            public void run() {
                Callback cb = A0Auth0Module.this.callback;
                if (cb != null) {
                    final WritableMap error = Arguments.createMap();
                    error.putString("error", "a0.session.user_cancelled");
                    error.putString("error_description", "User cancelled the Auth");
                    cb.invoke(error);
                    A0Auth0Module.this.callback = null;
                }
            }
        }, CANCEL_EVENT_DELAY);
    }

    @Override
    public void onHostPause() {

    }

    @Override
    public void onHostDestroy() {

    }

    /**
     * Query the OS for a Custom Tab compatible Browser application.
     * It will pick the default browser first if is Custom Tab compatible, then any Chrome browser or the first Custom Tab compatible browser.
     *
     * @param context a valid Context
     * @return the recommended Browser application package name, compatible with Custom Tabs. Null if no compatible browser is found.
     */
    static String getBestBrowserPackage(Activity activity) {
        PackageManager pm = activity.getPackageManager();
        Intent browserIntent = new Intent(Intent.ACTION_VIEW, Uri.parse("http://www.example.com"));
        ResolveInfo webHandler = pm.resolveActivity(browserIntent,
                Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? PackageManager.MATCH_ALL : PackageManager.MATCH_DEFAULT_ONLY);
        String defaultBrowser = null;
        if (webHandler != null) {
            defaultBrowser = webHandler.activityInfo.packageName;
        }

        List<ResolveInfo> resolvedActivityList = pm.queryIntentActivities(browserIntent, 0);
        List<String> customTabsBrowsers = new ArrayList<>();
        for (ResolveInfo info : resolvedActivityList) {
            Intent serviceIntent = new Intent();
            serviceIntent.setAction(ACTION_CUSTOM_TABS_CONNECTION);
            serviceIntent.setPackage(info.activityInfo.packageName);
            if (pm.resolveService(serviceIntent, 0) != null) {
                customTabsBrowsers.add(info.activityInfo.packageName);
            }
        }
        if (customTabsBrowsers.contains(defaultBrowser)) {
            return defaultBrowser;
        } else if (customTabsBrowsers.contains(CHROME_STABLE)) {
            return CHROME_STABLE;
        } else if (customTabsBrowsers.contains(CHROME_SYSTEM)) {
            return CHROME_SYSTEM;
        } else if (customTabsBrowsers.contains(CHROME_BETA)) {
            return CHROME_BETA;
        } else if (customTabsBrowsers.contains(CHROME_DEV)) {
            return CHROME_DEV;
        } else if (!customTabsBrowsers.isEmpty()) {
            return customTabsBrowsers.get(0);
        } else {
            return null;
        }
    }
}