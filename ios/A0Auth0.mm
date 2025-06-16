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

#ifdef RCT_NEW_ARCH_ENABLED
- (void)cancelWebAuth:(nonnull RCTPromiseResolveBlock)resolve reject:(nonnull RCTPromiseRejectBlock)reject { 
    [self.nativeBridge cancelWebAuthWithResolve:resolve reject:reject];
}


- (void)clearCredentials:(nonnull RCTPromiseResolveBlock)resolve reject:(nonnull RCTPromiseRejectBlock)reject { 
    [self.nativeBridge clearCredentialsWithResolve:resolve reject:reject];
}


- (void)getCredentials:(NSString * _Nullable)scope minTTL:(NSInteger)minTTL parameters:(nonnull NSDictionary *)parameters forceRefresh:(BOOL)forceRefresh resolve:(nonnull RCTPromiseResolveBlock)resolve reject:(nonnull RCTPromiseRejectBlock)reject { 
    [self.nativeBridge getCredentialsWithScope:scope minTTL:minTTL parameters:parameters forceRefresh:forceRefresh resolve:resolve reject:reject];
}


- (void)hasValidAuth0InstanceWithConfiguration:(nonnull NSString *)clientId domain:(nonnull NSString *)domain resolve:(nonnull RCTPromiseResolveBlock)resolve reject:(nonnull RCTPromiseRejectBlock)reject { 
    BOOL valid = [self checkHasValidNativeBridgeInstance:clientId domain:domain];
    resolve(@(valid));
}


- (void)hasValidCredentials:(NSInteger)minTTL resolve:(nonnull RCTPromiseResolveBlock)resolve reject:(nonnull RCTPromiseRejectBlock)reject { 
    [self.nativeBridge hasValidCredentialsWithMinTTL:minTTL resolve:resolve];
}


- (void)initializeAuth0WithConfiguration:(nonnull NSString *)clientId domain:(nonnull NSString *)domain localAuthenticationOptions:(nonnull NSDictionary *)localAuthenticationOptions resolve:(nonnull RCTPromiseResolveBlock)resolve reject:(nonnull RCTPromiseRejectBlock)reject { 
    [self tryAndInitializeNativeBridge:clientId domain:domain withLocalAuthenticationOptions:localAuthenticationOptions resolve:resolve reject:reject];
}


- (void)resumeWebAuth:(nonnull NSString *)url resolve:(nonnull RCTPromiseResolveBlock)resolve reject:(nonnull RCTPromiseRejectBlock)reject { 
    [self.nativeBridge resumeWebAuthWithUrl:url resolve:resolve reject:reject];
}


- (void)saveCredentials:(nonnull NSDictionary *)credentials resolve:(nonnull RCTPromiseResolveBlock)resolve reject:(nonnull RCTPromiseRejectBlock)reject { 
    [self.nativeBridge saveCredentialsWithCredentialsDict:credentials resolve:resolve reject:reject];
}


- (void)webAuth:(nonnull NSString *)scheme redirectUri:(nonnull NSString *)redirectUri state:(nonnull NSString *)state nonce:(nonnull NSString *)nonce audience:(nonnull NSString *)audience scope:(nonnull NSString *)scope connection:(nonnull NSString *)connection maxAge:(nonnull NSNumber *)maxAge organization:(nonnull NSString *)organization invitationUrl:(nonnull NSString *)invitationUrl leeway:(nonnull NSNumber *)leeway ephemeralSession:(nonnull NSNumber *)ephemeralSession safariViewControllerPresentationStyle:(nonnull NSNumber *)safariViewControllerPresentationStyle additionalParameters:(nonnull NSDictionary *)additionalParameters resolve:(nonnull RCTPromiseResolveBlock)resolve reject:(nonnull RCTPromiseRejectBlock)reject { 
    NSInteger maxAgeValue = maxAge != nil ? [maxAge integerValue] : 0;
    NSInteger leewayValue = leeway != nil ? [leeway integerValue] : 0;
    NSInteger safariStyleValue = safariViewControllerPresentationStyle != nil ? [safariViewControllerPresentationStyle integerValue] : 0;
    [self.nativeBridge webAuthWithScheme:scheme state:state redirectUri:redirectUri nonce:nonce audience:audience scope:scope connection:connection maxAge:maxAgeValue organization:organization invitationUrl:invitationUrl leeway:leewayValue ephemeralSession:ephemeralSession safariViewControllerPresentationStyle:safariStyleValue additionalParameters:additionalParameters resolve:resolve reject:reject];
}


- (void)webAuthLogout:(nonnull NSString *)scheme federated:(BOOL)federated redirectUri:(nonnull NSString *)redirectUri resolve:(nonnull RCTPromiseResolveBlock)resolve reject:(nonnull RCTPromiseRejectBlock)reject { 
    [self.nativeBridge webAuthLogoutWithScheme:scheme federated:federated redirectUri:redirectUri resolve:resolve reject:reject];
}

#else

RCT_EXPORT_METHOD(hasValidAuth0InstanceWithConfiguration:(NSString *)clientId domain:(NSString *)domain resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
    BOOL valid = [self checkHasValidNativeBridgeInstance:clientId domain:domain];
    resolve(@(valid));
}


RCT_EXPORT_METHOD(initializeAuth0WithConfiguration:(NSString *)clientId domain:(NSString *)domain localAuthenticationOptions:(NSDictionary*) options resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
    [self tryAndInitializeNativeBridge:clientId domain:domain withLocalAuthenticationOptions:options resolve:resolve reject:reject];
}

RCT_EXPORT_METHOD(saveCredentials:(NSDictionary *)credentials resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
    [self.nativeBridge saveCredentialsWithCredentialsDict:credentials resolve:resolve reject:reject];
}

RCT_EXPORT_METHOD(getCredentials:(NSString *)scope minTTL:(NSInteger)minTTL parameters:(NSDictionary *)parameters forceRefresh:(BOOL)forceRefresh resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
    [self.nativeBridge getCredentialsWithScope:scope minTTL:minTTL parameters:parameters forceRefresh:forceRefresh resolve:resolve reject:reject];
}

RCT_EXPORT_METHOD(hasValidCredentials:(NSInteger)minTTL resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
    [self.nativeBridge hasValidCredentialsWithMinTTL:minTTL resolve:resolve];
}

RCT_EXPORT_METHOD(clearCredentials:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
    [self.nativeBridge clearCredentialsWithResolve:resolve reject:reject];
}

RCT_EXPORT_METHOD(webAuth:(NSString *)scheme redirectUri:(NSString *)redirectUri state:(NSString *)state nonce:(NSString *)nonce audience:(NSString *)audience scope:(NSString *)scope connection:(NSString *)connection maxAge:(NSInteger)maxAge organization:(NSString *)organization invitationUrl:(NSString *)invitationUrl  leeway:(NSInteger)leeway ephemeralSession:(BOOL)ephemeralSession safariViewControllerPresentationStyle:(NSInteger)safariViewControllerPresentationStyle additionalParameters:(NSDictionary *)additionalParameters resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
    [self.nativeBridge webAuthWithScheme:scheme state:state redirectUri:redirectUri nonce:nonce audience:audience scope:scope connection:connection maxAge:maxAge organization:organization invitationUrl:invitationUrl leeway:leeway ephemeralSession:ephemeralSession safariViewControllerPresentationStyle:safariViewControllerPresentationStyle additionalParameters:additionalParameters resolve:resolve reject:reject];
}

RCT_EXPORT_METHOD(webAuthLogout:(NSString *)scheme federated:(BOOL)federated redirectUri:(NSString *)redirectUri resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
    [self.nativeBridge webAuthLogoutWithScheme:scheme federated:federated redirectUri:redirectUri resolve:resolve reject:reject];
}

RCT_EXPORT_METHOD(resumeWebAuth:(NSString *)url resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
    [self.nativeBridge resumeWebAuthWithUrl:url resolve:resolve reject:reject];
}

RCT_EXPORT_METHOD(cancelWebAuth:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
    [self.nativeBridge cancelWebAuthWithResolve:resolve reject:reject];
}

#endif



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
