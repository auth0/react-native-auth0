package com.auth0.react;

import androidx.annotation.NonNull;

import com.facebook.react.TurboReactPackage;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.module.model.ReactModuleInfoProvider;
import com.facebook.react.module.model.ReactModuleInfo;

import java.util.HashMap;
import java.util.Map;

public class A0Auth0Package extends TurboReactPackage {
    @Override
    public NativeModule getModule(String name, ReactApplicationContext reactContext) {
        if (name.equals(A0Auth0Module.NAME)) {
            return new A0Auth0Module(reactContext);
        } else {
            return null;
        }
    }

    @NonNull
    @Override
    public ReactModuleInfoProvider getReactModuleInfoProvider() {
        return () -> {
            Map<String, ReactModuleInfo> moduleInfos = new HashMap<>();
            boolean isTurboModule = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED;
            moduleInfos.put(
                A0Auth0Module.NAME,
                new ReactModuleInfo(
                    A0Auth0Module.NAME,
                    A0Auth0Module.NAME,
                    false,  // canOverrideExistingModule
                    false,  // needsEagerInit
                    true,   // hasConstants
                    false,  // isCxxModule
                    isTurboModule // isTurboModule
                )
            );
            return moduleInfos;
        };
    }
}