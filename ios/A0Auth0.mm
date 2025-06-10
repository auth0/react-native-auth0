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

RCT_EXPORT_METHOD(getBundleIdentifier:(nonnull RCTPromiseResolveBlock)resolve reject:(nonnull RCTPromiseRejectBlock)reject) {
    resolve([[NSBundle mainBundle] bundleIdentifier]);
}

RCT_EXPORT_METHOD(hasValidAuth0InstanceWithConfiguration:(nonnull NSString *)clientId domain:(nonnull NSString *)domain resolve:(nonnull RCTPromiseResolveBlock)resolve reject:(nonnull RCTPromiseRejectBlock)reject) {
    BOOL valid = [self checkHasValidNativeBridgeInstance:clientId domain:domain];
    resolve(@(valid));
}


#ifdef RCT_NEW_ARCH_ENABLED

RCT_EXPORT_METHOD(initializeAuth0WithConfiguration:(nonnull NSString *)clientId domain:(nonnull NSString *)domain localAuthenticationOptions:(JS::NativeA0Auth0::LocalAuthenticationOptions &)localAuthenticationOptions resolve:(nonnull RCTPromiseResolveBlock)resolve reject:(nonnull RCTPromiseRejectBlock)reject) {
    NSMutableDictionary *options = [[NSMutableDictionary alloc] init];
    
    if (localAuthenticationOptions.title()) {
        options[@"title"] = localAuthenticationOptions.title();
    }
    if (localAuthenticationOptions.subtitle()) {
        options[@"subtitle"] = localAuthenticationOptions.subtitle();
    }
    if (localAuthenticationOptions.description()) {
        options[@"description"] = localAuthenticationOptions.description();
    }
    if (localAuthenticationOptions.cancelTitle()) {
        options[@"cancelTitle"] = localAuthenticationOptions.cancelTitle();
    }
    if (localAuthenticationOptions.evaluationPolicy()) {
        options[@"evaluationPolicy"] = @((NSInteger)localAuthenticationOptions.evaluationPolicy().value());
    }
    if (localAuthenticationOptions.fallbackTitle()) {
        options[@"fallbackTitle"] = localAuthenticationOptions.fallbackTitle();
    }
    if (localAuthenticationOptions.authenticationLevel()) {
        options[@"authenticationLevel"] = @((NSInteger)localAuthenticationOptions.authenticationLevel().value());
    }
    if (localAuthenticationOptions.deviceCredentialFallback()) {
        options[@"deviceCredentialFallback"] = @((NSInteger)localAuthenticationOptions.deviceCredentialFallback().value());
    }
    [self tryAndInitializeNativeBridge:clientId domain:domain withLocalAuthenticationOptions:options resolver:resolve rejecter:reject];
}

RCT_EXPORT_METHOD(saveCredentials:(JS::NativeA0Auth0::Credentials &)credentials resolve:(nonnull RCTPromiseResolveBlock)resolve reject:(nonnull RCTPromiseRejectBlock)reject) {
    NSMutableDictionary *credentialsDict = [NSMutableDictionary dictionary];
    
    credentialsDict[@"idToken"] = credentials.idToken();
    credentialsDict[@"accessToken"] = credentials.accessToken();
    credentialsDict[@"tokenType"] = credentials.tokenType();
    credentialsDict[@"expiresAt"] = @(credentials.expiresAt());
    if (credentials.refreshToken()) {
        credentialsDict[@"refreshToken"] = credentials.refreshToken();
    } 
    if (credentials.scope()) {
        credentialsDict[@"scope"] = credentials.scope();
    } 
    [self.nativeBridge saveCredentialsWithCredentialsDict:credentialsDict resolve:resolve reject:reject];
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:(const facebook::react::ObjCTurboModule::InitParams &)params { 
    return std::make_shared<facebook::react::NativeA0Auth0SpecJSI>(params);
}

#else
RCT_EXPORT_METHOD(initializeAuth0WithConfiguration:(NSString *)clientId domain:(NSString *)domain localAuthenticationOptions:(NSDictionary*) options resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    [self tryAndInitializeNativeBridge:clientId domain:domain withLocalAuthenticationOptions:options resolver:resolve rejecter:reject];
}

RCT_EXPORT_METHOD(saveCredentials:(NSDictionary *)credentials resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    [self.nativeBridge saveCredentialsWithCredentialsDict:credentials resolve:resolve reject:reject];
}
#endif

RCT_EXPORT_METHOD(getCredentials:(NSString * _Nullable)scope minTTL:(double)minTTL parameters:(nonnull NSDictionary *)parameters forceRefresh:(BOOL)forceRefresh resolve:(nonnull RCTPromiseResolveBlock)resolve reject:(nonnull RCTPromiseRejectBlock)reject) {
    [self.nativeBridge getCredentialsWithScope:scope minTTL:minTTL parameters:parameters forceRefresh:forceRefresh resolve:resolve reject:reject];
}

RCT_EXPORT_METHOD(hasValidCredentials:(double)minTTL resolve:(nonnull RCTPromiseResolveBlock)resolve reject:(nonnull RCTPromiseRejectBlock)reject) {
    [self.nativeBridge hasValidCredentialsWithMinTTL:minTTL resolve:resolve];
}

RCT_EXPORT_METHOD(clearCredentials:(nonnull RCTPromiseResolveBlock)resolve reject:(nonnull RCTPromiseRejectBlock)reject) {
    [self.nativeBridge clearCredentialsWithResolve:resolve reject:reject];
}

RCT_EXPORT_METHOD(webAuth:(nonnull NSString *)scheme redirectUri:(nonnull NSString *)redirectUri state:(nonnull NSString *)state nonce:(nonnull NSString *)nonce audience:(nonnull NSString *)audience scope:(nonnull NSString *)scope connection:(nonnull NSString *)connection maxAge:(nonnull NSNumber *)maxAge organization:(nonnull NSString *)organization invitationUrl:(nonnull NSString *)invitationUrl leeway:(nonnull NSNumber *)leeway ephemeralSession:(nonnull NSNumber *)ephemeralSession safariViewControllerPresentationStyle:(nonnull NSNumber *)safariViewControllerPresentationStyle additionalParameters:(nonnull NSDictionary *)additionalParameters resolve:(nonnull RCTPromiseResolveBlock)resolve reject:(nonnull RCTPromiseRejectBlock)reject) {
    [self.nativeBridge webAuthWithScheme:scheme state:state redirectUri:redirectUri nonce:nonce audience:audience scope:scope connection:connection maxAge:[maxAge integerValue] organization:organization invitationUrl:invitationUrl leeway:[leeway integerValue] ephemeralSession:[ephemeralSession boolValue] safariViewControllerPresentationStyle:[safariViewControllerPresentationStyle integerValue] additionalParameters:additionalParameters resolve:resolve reject:reject];
}

RCT_EXPORT_METHOD(webAuthLogout:(nonnull NSString *)scheme federated:(BOOL)federated redirectUri:(nonnull NSString *)redirectUri resolve:(nonnull RCTPromiseResolveBlock)resolve reject:(nonnull RCTPromiseRejectBlock)reject) {
    [self.nativeBridge webAuthLogoutWithScheme:scheme federated:federated redirectUri:redirectUri resolve:resolve reject:reject];
}

RCT_EXPORT_METHOD(resumeWebAuth:(nonnull NSString *)url resolve:(nonnull RCTPromiseResolveBlock)resolve reject:(nonnull RCTPromiseRejectBlock)reject) {
    [self.nativeBridge resumeWebAuthWithUrl:url resolve:resolve reject:reject];
}

RCT_EXPORT_METHOD(cancelWebAuth:(nonnull RCTPromiseResolveBlock)resolve reject:(nonnull RCTPromiseRejectBlock)reject) {
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
