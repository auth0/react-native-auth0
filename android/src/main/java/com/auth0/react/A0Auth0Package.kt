package com.auth0.react

import com.facebook.react.TurboReactPackage
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.NativeModule
import com.facebook.react.module.model.ReactModuleInfoProvider
import com.facebook.react.module.model.ReactModuleInfo

class A0Auth0Package : TurboReactPackage() {
    
    override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? {
        return if (name == A0Auth0Module.NAME) {
            A0Auth0Module(reactContext)
        } else {
            null
        }
    }

    override fun getReactModuleInfoProvider(): ReactModuleInfoProvider {
        return ReactModuleInfoProvider {
            val moduleInfos = mutableMapOf<String, ReactModuleInfo>()
            val isTurboModule = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
            
            moduleInfos[A0Auth0Module.NAME] = ReactModuleInfo(
                A0Auth0Module.NAME,
                A0Auth0Module.NAME,
                false,  // canOverrideExistingModule
                false,  // needsEagerInit
                true,   // hasConstants
                false,  // isCxxModule
                isTurboModule // isTurboModule
            )
            
            moduleInfos
        }
    }
}