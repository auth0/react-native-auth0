#import "A0Auth0.h"

#import <React/RCTUtils.h>

#ifdef RCT_NEW_ARCH_ENABLED
#import "RNAuth0Spec/RNAuth0Spec.h"
#endif

/**
 * This preprocessor directive resolves the static linking issue by ensuring
 * the correct import of the Swift header file generated for the A0Auth0 module.
 * It checks for the presence of the header file in different locations:
 * 1. If the header is available in the framework's module path (<A0Auth0/A0Auth0-Swift.h>),
 *    it imports it from there.
 * 2. As a fallback, it imports the header from the local path to ensure compatibility.
 */
#if __has_include(<A0Auth0/A0Auth0-Swift.h>)
    #import <A0Auth0/A0Auth0-Swift.h>
#else
    #import "A0Auth0-Swift.h"
#endif

#define ERROR_CANCELLED @{@"error": @"a0.session.user_cancelled",@"error_description": @"User cancelled the Auth"}
#define ERROR_FAILED_TO_LOAD @{@"error": @"a0.session.failed_load",@"error_description": @"Failed to load url"}

@interface A0Auth0 ()
@property (strong, nonatomic) NativeBridge *nativeBridge;
@end

@implementation A0Auth0

- (dispatch_queue_t)methodQueue
{
    return dispatch_get_main_queue();
}

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(getBundleIdentifier:(nonnull RCTPromiseResolveBlock)resolve reject:(nonnull RCTPromiseRejectBlock)reject) { 
    resolve([[NSBundle mainBundle] bundleIdentifier]);
}

RCT_EXPORT_METHOD(cancelWebAuth:(RCTPromiseResolveBlock)resolve
               reject:(RCTPromiseRejectBlock)reject) { 
    [self.nativeBridge cancelWebAuthWithResolve:resolve reject:reject];
}


RCT_EXPORT_METHOD(clearCredentials:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) { 
    [self.nativeBridge clearCredentialsWithResolve:resolve reject:reject];
}


RCT_EXPORT_METHOD(getCredentials:(NSString * _Nullable)scope
                minTTL:(NSInteger)minTTL
            parameters:(NSDictionary *)parameters
          forceRefresh:(BOOL)forceRefresh
               resolve:(RCTPromiseResolveBlock)resolve
                reject:(RCTPromiseRejectBlock)reject) { 
    [self.nativeBridge getCredentialsWithScope:scope minTTL:minTTL parameters:parameters forceRefresh:forceRefresh resolve:resolve reject:reject];
}


RCT_EXPORT_METHOD(hasValidAuth0InstanceWithConfiguration:(NSString *)clientId
                                        domain:(NSString *)domain
                                       resolve:(RCTPromiseResolveBlock)resolve
                                        reject:(RCTPromiseRejectBlock)reject) { 
    BOOL valid = [self checkHasValidNativeBridgeInstance:clientId domain:domain];
    resolve(@(valid));
}


RCT_EXPORT_METHOD(hasValidCredentials:(NSInteger)minTTL
                    resolve:(RCTPromiseResolveBlock)resolve
                     reject:(RCTPromiseRejectBlock)reject) { 
    [self.nativeBridge hasValidCredentialsWithMinTTL:minTTL resolve:resolve];
}

RCT_EXPORT_METHOD(getApiCredentials: (NSString *)audience
                  scope:(NSString * _Nullable)scope
                  minTTL:(NSInteger)minTTL
                  parameters:(NSDictionary *)parameters
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
    [self.nativeBridge getApiCredentialsWithAudience:audience scope:scope minTTL:minTTL parameters:parameters resolve:resolve reject:reject];
}

RCT_EXPORT_METHOD(clearApiCredentials: (NSString *)audience
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
    [self.nativeBridge clearApiCredentialsWithAudience:audience resolve:resolve reject:reject];
}


RCT_EXPORT_METHOD(initializeAuth0WithConfiguration:(NSString *)clientId
                                  domain:(NSString *)domain
              localAuthenticationOptions:(NSDictionary * _Nullable)localAuthenticationOptions
                                 resolve:(RCTPromiseResolveBlock)resolve
                                  reject:(RCTPromiseRejectBlock)reject) { 
    [self tryAndInitializeNativeBridge:clientId domain:domain withLocalAuthenticationOptions:localAuthenticationOptions resolve:resolve reject:reject];
}


RCT_EXPORT_METHOD(resumeWebAuth:(NSString *)url
              resolve:(RCTPromiseResolveBlock)resolve
               reject:(RCTPromiseRejectBlock)reject) { 
    [self.nativeBridge resumeWebAuthWithUrl:url resolve:resolve reject:reject];
}


RCT_EXPORT_METHOD(saveCredentials:(NSDictionary *)credentials
                resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) { 
    [self.nativeBridge saveCredentialsWithCredentialsDict:credentials resolve:resolve reject:reject];
}


RCT_EXPORT_METHOD(webAuth:(NSString *)scheme
    redirectUri:(NSString *)redirectUri
          state:(NSString * _Nullable)state
          nonce:(NSString * _Nullable)nonce
       audience:(NSString * _Nullable)audience
          scope:(NSString * _Nullable)scope
     connection:(NSString * _Nullable)connection
         maxAge:(nonnull NSNumber *)maxAge
   organization:(NSString * _Nullable)organization
  invitationUrl:(NSString * _Nullable)invitationUrl
         leeway:(nonnull NSNumber *)leeway
ephemeralSession:(nonnull NSNumber *)ephemeralSession
safariViewControllerPresentationStyle:(nonnull NSNumber *)safariViewControllerPresentationStyle
additionalParameters:(NSDictionary * _Nullable)additionalParameters
        resolve:(RCTPromiseResolveBlock)resolve
         reject:(RCTPromiseRejectBlock)reject) { 
    NSInteger maxAgeValue = maxAge != nil ? [maxAge integerValue] : 0;
    NSInteger leewayValue = leeway != nil ? [leeway integerValue] : 0;
    NSInteger safariStyleValue = safariViewControllerPresentationStyle != nil ? [safariViewControllerPresentationStyle integerValue] : 0;
    BOOL ephemeralSessionBool = [ephemeralSession boolValue];
    
    [self.nativeBridge webAuthWithScheme:scheme state:state redirectUri:redirectUri nonce:nonce audience:audience scope:scope connection:connection maxAge:maxAgeValue organization:organization invitationUrl:invitationUrl leeway:leewayValue ephemeralSession:ephemeralSessionBool safariViewControllerPresentationStyle:safariStyleValue additionalParameters:additionalParameters resolve:resolve reject:reject];
}


RCT_EXPORT_METHOD(webAuthLogout:(NSString *)scheme
            federated:(BOOL)federated
          redirectUri:(NSString *)redirectUri
              resolve:(RCTPromiseResolveBlock)resolve
               reject:(RCTPromiseRejectBlock)reject) { 
    [self.nativeBridge webAuthLogoutWithScheme:scheme federated:federated redirectUri:redirectUri resolve:resolve reject:reject];
}




- (NSDictionary *)constantsToExport {
    return @{ @"bundleIdentifier": [[NSBundle mainBundle] bundleIdentifier] };
}

+ (BOOL)requiresMainQueueSetup {
    return YES;
}

#pragma mark - Internal methods

UIBackgroundTaskIdentifier taskId;

- (BOOL)checkHasValidNativeBridgeInstance:(NSString*) clientId domain:(NSString *)domain {
    BOOL valid = self.nativeBridge != nil && [self.nativeBridge.getClientId isEqual:clientId] && [self.nativeBridge.getDomain isEqual:domain];
    return valid;
}

- (void)tryAndInitializeNativeBridge:(NSString *)clientId domain:(NSString *)domain withLocalAuthenticationOptions:(NSDictionary*) options resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
    NativeBridge *bridge = [[NativeBridge alloc] initWithClientId:clientId domain:domain localAuthenticationOptions:options resolve:resolve reject:reject];
    self.nativeBridge = bridge;
}
#ifdef RCT_NEW_ARCH_ENABLED
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:(const facebook::react::ObjCTurboModule::InitParams &)params { 
    return std::make_shared<facebook::react::NativeA0Auth0SpecJSI>(params);
}
#endif

@end
