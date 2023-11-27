#import "A0Auth0.h"

#import <React/RCTUtils.h>

#import "A0Auth0-Swift.h"
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

RCT_EXPORT_METHOD(hasValidAuth0Instance:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    BOOL valid = [self checkHasValidNativeBridgeInstance];
    resolve(@(valid));
}


RCT_EXPORT_METHOD(initializeAuth0:(NSString *)clientId domain:(NSString *)domain) {
    [self tryAndInitializeNativeBridge:clientId domain:domain];
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

RCT_EXPORT_METHOD(enableLocalAuthentication:(NSString *)title cancelTitle:(NSString *)cancelTitle fallbackTitle:(NSString *)fallbackTitle evaluationPolicy:(NSInteger)evaluationPolicy) {
    [self.nativeBridge enableLocalAuthenticationWithTitle:title cancelTitle:cancelTitle fallbackTitle:fallbackTitle evaluationPolicy: evaluationPolicy];
}

RCT_EXPORT_METHOD(webAuth:(NSString *)scheme redirectUri:(NSString *)redirectUri state:(NSString *)state nonce:(NSString *)nonce audience:(NSString *)audience scope:(NSString *)scope connection:(NSString *)connection maxAge:(NSInteger)maxAge organization:(NSString *)organization invitationUrl:(NSString *)invitationUrl  leeway:(NSInteger)leeway ephemeralSession:(BOOL)ephemeralSession safariViewControllerPresentationStyle:(NSInteger)safariViewControllerPresentationStyle additionalParameters:(NSDictionary *)additionalParameters resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    [self.nativeBridge webAuthWithState:state redirectUri:redirectUri nonce:nonce audience:audience scope:scope connection:connection maxAge:maxAge organization:organization invitationUrl:invitationUrl leeway:leeway ephemeralSession:ephemeralSession safariViewControllerPresentationStyle:safariViewControllerPresentationStyle additionalParameters:additionalParameters resolve:resolve reject:reject];
}

RCT_EXPORT_METHOD(webAuthLogout:(NSString *)scheme federated:(BOOL)federated redirectUri:(NSString *)redirectUri resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    [self.nativeBridge webAuthLogoutWithFederated:federated redirectUri:redirectUri resolve:resolve reject:reject];
}

RCT_EXPORT_METHOD(resumeWebAuth:(NSString *)url resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    [self.nativeBridge resumeWebAuthWithUrl:url resolve:resolve reject:reject];
}

- (NSDictionary *)constantsToExport {
    return @{ @"bundleIdentifier": [[NSBundle mainBundle] bundleIdentifier] };
}

+ (BOOL)requiresMainQueueSetup {
    return YES;
}

#pragma mark - Internal methods

UIBackgroundTaskIdentifier taskId;

- (BOOL)checkHasValidNativeBridgeInstance {
    BOOL valid = self.nativeBridge != nil;
    return valid;
}

- (void)tryAndInitializeNativeBridge:(NSString *)clientId domain:(NSString *)domain {
    NativeBridge *bridge = [[NativeBridge alloc] initWithClientId: clientId domain: domain];
    self.nativeBridge = bridge;
}

@end
