#import "A0Auth0.h"

#import <React/RCTUtils.h>

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

RCT_EXPORT_METHOD(getBundleIdentifier:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    resolve([[NSBundle mainBundle] bundleIdentifier]);
}

RCT_EXPORT_METHOD(hasValidAuth0InstanceWithConfiguration:(NSString *)clientId domain:(NSString *)domain resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    BOOL valid = [self checkHasValidNativeBridgeInstance:clientId domain:domain];
    resolve(@(valid));
}


RCT_EXPORT_METHOD(initializeAuth0WithConfiguration:(NSString *)clientId domain:(NSString *)domain localAuthenticationOptions:(NSDictionary*) options resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    [self tryAndInitializeNativeBridge:clientId domain:domain withLocalAuthenticationOptions:options resolver:resolve rejecter:reject];
}

RCT_EXPORT_METHOD(saveCredentials:(NSDictionary *)credentials resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    [self.nativeBridge saveCredentialsWithCredentialsDict:credentials resolve:resolve reject:reject];
}

RCT_EXPORT_METHOD(getCredentials:(NSString *)scope minTTL:(NSInteger)minTTL parameters:(NSDictionary *)parameters forceRefresh:(BOOL)forceRefresh resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    [self.nativeBridge getCredentialsWithScope:scope minTTL:minTTL parameters:parameters forceRefresh:forceRefresh resolve:resolve reject:reject];
}

RCT_EXPORT_METHOD(hasValidCredentials:(NSInteger)minTTL resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    [self.nativeBridge hasValidCredentialsWithMinTTL:minTTL resolve:resolve];
}

RCT_EXPORT_METHOD(clearCredentials:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    [self.nativeBridge clearCredentialsWithResolve:resolve reject:reject];
}

RCT_EXPORT_METHOD(webAuth:(NSString *)scheme redirectUri:(NSString *)redirectUri state:(NSString *)state nonce:(NSString *)nonce audience:(NSString *)audience scope:(NSString *)scope connection:(NSString *)connection maxAge:(NSInteger)maxAge organization:(NSString *)organization invitationUrl:(NSString *)invitationUrl  leeway:(NSInteger)leeway ephemeralSession:(BOOL)ephemeralSession safariViewControllerPresentationStyle:(NSInteger)safariViewControllerPresentationStyle additionalParameters:(NSDictionary *)additionalParameters resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    [self.nativeBridge webAuthWithScheme:scheme state:state redirectUri:redirectUri nonce:nonce audience:audience scope:scope connection:connection maxAge:maxAge organization:organization invitationUrl:invitationUrl leeway:leeway ephemeralSession:ephemeralSession safariViewControllerPresentationStyle:safariViewControllerPresentationStyle additionalParameters:additionalParameters resolve:resolve reject:reject];
}

RCT_EXPORT_METHOD(webAuthLogout:(NSString *)scheme federated:(BOOL)federated redirectUri:(NSString *)redirectUri resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    [self.nativeBridge webAuthLogoutWithScheme:scheme federated:federated redirectUri:redirectUri resolve:resolve reject:reject];
}

RCT_EXPORT_METHOD(resumeWebAuth:(NSString *)url resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    [self.nativeBridge resumeWebAuthWithUrl:url resolve:resolve reject:reject];
}

RCT_EXPORT_METHOD(cancelWebAuth:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    [self.nativeBridge cancelWebAuthWithResolve:resolve reject:reject];
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

- (void)tryAndInitializeNativeBridge:(NSString *)clientId domain:(NSString *)domain withLocalAuthenticationOptions:(NSDictionary*) options resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject {
    NativeBridge *bridge = [[NativeBridge alloc] initWithClientId:clientId domain:domain localAuthenticationOptions:options resolve:resolve reject:reject];
    self.nativeBridge = bridge;
}

@end
