#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(PasskeyModule, NSObject)

RCT_EXTERN_METHOD(createPasskey:(NSString *)requestJson
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getPasskey:(NSString *)requestJson
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

+ (BOOL)requiresMainQueueSetup {
  return YES;
}

@end
