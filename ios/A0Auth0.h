#ifdef RCT_NEW_ARCH_ENABLED
#import "RNAuth0Spec.h"

@interface A0Auth0 : NSObject <NativeA0Auth0Spec>
#else
#import <React/RCTBridgeModule.h>

@interface A0Auth0 : NSObject <RCTBridgeModule>
#endif

@end

@class NativeBridge;
