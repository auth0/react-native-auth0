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
@property (strong, nonatomic) A0MyAccount *myAccount;
@property (strong, nonatomic) A0Passwordless *passwordless;
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
                minTTL:(double)minTTL
            parameters:(NSDictionary *)parameters
          forceRefresh:(BOOL)forceRefresh
               resolve:(RCTPromiseResolveBlock)resolve
                reject:(RCTPromiseRejectBlock)reject) { 
    [self.nativeBridge getCredentialsWithScope:scope minTTL:(NSInteger)minTTL parameters:parameters forceRefresh:forceRefresh resolve:resolve reject:reject];
}


RCT_EXPORT_METHOD(hasValidAuth0InstanceWithConfiguration:(NSString *)clientId
                                        domain:(NSString *)domain
                                       resolve:(RCTPromiseResolveBlock)resolve
                                        reject:(RCTPromiseRejectBlock)reject) { 
    BOOL valid = [self checkHasValidNativeBridgeInstance:clientId domain:domain];
    resolve(@(valid));
}


RCT_EXPORT_METHOD(hasValidCredentials:(double)minTTL
                    resolve:(RCTPromiseResolveBlock)resolve
                     reject:(RCTPromiseRejectBlock)reject) { 
    [self.nativeBridge hasValidCredentialsWithMinTTL:(NSInteger)minTTL resolve:resolve];
}

RCT_EXPORT_METHOD(getApiCredentials: (NSString *)audience
                  scope:(NSString * _Nullable)scope
                  minTTL:(double)minTTL
                  parameters:(NSDictionary *)parameters
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
    [self.nativeBridge getApiCredentialsWithAudience:audience scope:scope minTTL:(NSInteger)minTTL parameters:parameters resolve:resolve reject:reject];
}

RCT_EXPORT_METHOD(clearApiCredentials: (NSString *)audience
                  scope:(NSString * _Nullable)scope
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
    [self.nativeBridge clearApiCredentialsWithAudience:audience scope:scope resolve:resolve reject:reject];
}


RCT_EXPORT_METHOD(initializeAuth0WithConfiguration:(NSString *)clientId
                                  domain:(NSString *)domain
              localAuthenticationOptions:(NSDictionary * _Nullable)localAuthenticationOptions
                                  useDPoP:(nonnull NSNumber *)useDPoP
                               maxRetries:(double)maxRetries
            credentialsManagerStorageKey:(NSString * _Nullable)credentialsManagerStorageKey
                                 resolve:(RCTPromiseResolveBlock)resolve
                                  reject:(RCTPromiseRejectBlock)reject) {
    [self tryAndInitializeNativeBridge:clientId domain:domain withLocalAuthenticationOptions:localAuthenticationOptions useDPoP:useDPoP maxRetries:(NSInteger)maxRetries credentialsManagerStorageKey:credentialsManagerStorageKey resolve:resolve reject:reject];
}


RCT_EXPORT_METHOD(resumeWebAuth:(NSString *)url
              resolve:(RCTPromiseResolveBlock)resolve
               reject:(RCTPromiseRejectBlock)reject) {
    [self.nativeBridge resumeWebAuthWithUrl:url resolve:resolve reject:reject];
}


RCT_EXPORT_METHOD(resumeWebAuthSession:(RCTPromiseResolveBlock)resolve
               reject:(RCTPromiseRejectBlock)reject) {
    // Android-only process-death recovery. iOS uses ASWebAuthenticationSession,
    // which has no equivalent failure mode, so this resolves null.
    resolve([NSNull null]);
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
 allowedBrowserPackages:(NSArray * _Nullable)allowedBrowserPackages
 useTrustedWebActivity:(BOOL)useTrustedWebActivity
        resolve:(RCTPromiseResolveBlock)resolve
         reject:(RCTPromiseRejectBlock)reject) {
    NSInteger maxAgeValue = maxAge != nil ? (NSInteger)[maxAge doubleValue] : 0;
    NSInteger leewayValue = leeway != nil ? (NSInteger)[leeway doubleValue] : 0;
    NSInteger safariStyleValue = safariViewControllerPresentationStyle != nil ? (NSInteger)[safariViewControllerPresentationStyle doubleValue] : 0;
    BOOL ephemeralSessionBool = [ephemeralSession boolValue];
    
    [self.nativeBridge webAuthWithScheme:scheme state:state redirectUri:redirectUri nonce:nonce audience:audience scope:scope connection:connection maxAge:maxAgeValue organization:organization invitationUrl:invitationUrl leeway:leewayValue ephemeralSession:ephemeralSessionBool safariViewControllerPresentationStyle:safariStyleValue additionalParameters:additionalParameters resolve:resolve reject:reject];
}


RCT_EXPORT_METHOD(webAuthLogout:(NSString *)scheme
            federated:(BOOL)federated
          redirectUri:(NSString *)redirectUri
 allowedBrowserPackages:(NSArray * _Nullable)allowedBrowserPackages
 useTrustedWebActivity:(BOOL)useTrustedWebActivity
              resolve:(RCTPromiseResolveBlock)resolve
               reject:(RCTPromiseRejectBlock)reject) {
    [self.nativeBridge webAuthLogoutWithScheme:scheme federated:federated redirectUri:redirectUri resolve:resolve reject:reject];
}

RCT_EXPORT_METHOD(clearDPoPKey:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
    [self.nativeBridge clearDPoPKeyWithResolve:resolve reject:reject];
}


RCT_EXPORT_METHOD(getDPoPHeaders:(NSString *)url method:(NSString *)method accessToken:(NSString *)accessToken tokenType:(NSString *)tokenType nonce:(NSString *)nonce resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
    [self.nativeBridge getDPoPHeadersWithUrl:url method:method accessToken:accessToken tokenType:tokenType nonce:nonce resolve:resolve reject:reject];
}

RCT_EXPORT_METHOD(getSSOCredentials:(NSDictionary *)parameters
                headers:(NSDictionary *)headers
                resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    [self.nativeBridge getSSOCredentialsWithParameters:parameters headers:headers resolve:resolve reject:reject];
}

RCT_EXPORT_METHOD(customTokenExchange:(NSString *)subjectToken
                  subjectTokenType:(NSString *)subjectTokenType
                  audience:(NSString * _Nullable)audience
                  scope:(NSString * _Nullable)scope
                  organization:(NSString * _Nullable)organization
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
    [self.nativeBridge customTokenExchangeWithSubjectToken:subjectToken subjectTokenType:subjectTokenType audience:audience scope:scope organization:organization resolve:resolve reject:reject];
}

RCT_EXPORT_METHOD(passkeySignupChallenge:(NSString * _Nullable)email
                  phoneNumber:(NSString * _Nullable)phoneNumber
                  username:(NSString * _Nullable)username
                  name:(NSString * _Nullable)name
                  givenName:(NSString * _Nullable)givenName
                  familyName:(NSString * _Nullable)familyName
                  nickname:(NSString * _Nullable)nickname
                  picture:(NSString * _Nullable)picture
                  userMetadata:(NSDictionary * _Nullable)userMetadata
                  realm:(NSString * _Nullable)realm
                  organization:(NSString * _Nullable)organization
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
    [self.nativeBridge passkeySignupChallengeWithEmail:email phoneNumber:phoneNumber username:username name:name givenName:givenName familyName:familyName nickname:nickname picture:picture userMetadata:userMetadata realm:realm organization:organization resolve:resolve reject:reject];
}

RCT_EXPORT_METHOD(passkeyLoginChallenge:(NSString * _Nullable)realm
                  organization:(NSString * _Nullable)organization
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
    [self.nativeBridge passkeyLoginChallengeWithRealm:realm organization:organization resolve:resolve reject:reject];
}

RCT_EXPORT_METHOD(getTokenByPasskey:(NSString *)authSession
                  authResponse:(NSString *)authResponse
                  realm:(NSString * _Nullable)realm
                  audience:(NSString * _Nullable)audience
                  scope:(NSString * _Nullable)scope
                  organization:(NSString * _Nullable)organization
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
    [self.nativeBridge getTokenByPasskeyWithAuthSession:authSession authResponse:authResponse realm:realm audience:audience scope:scope organization:organization resolve:resolve reject:reject];
}

RCT_EXPORT_METHOD(passwordlessChallengeWithEmail:(NSString *)email
                  connection:(NSString *)connection
                  allowSignup:(BOOL)allowSignup
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
    [self.passwordless challengeWithEmail:email connection:connection allowSignup:allowSignup resolve:resolve reject:reject];
}

RCT_EXPORT_METHOD(passwordlessChallengeWithPhoneNumber:(NSString *)phoneNumber
                  connection:(NSString *)connection
                  deliveryMethod:(NSString *)deliveryMethod
                  allowSignup:(BOOL)allowSignup
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
    [self.passwordless challengeWithPhoneNumber:phoneNumber connection:connection deliveryMethod:deliveryMethod allowSignup:allowSignup resolve:resolve reject:reject];
}

RCT_EXPORT_METHOD(passwordlessLoginWithOTP:(NSString *)authSession
                  otp:(NSString *)otp
                  audience:(NSString * _Nullable)audience
                  scope:(NSString * _Nullable)scope
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
    [self.passwordless loginWithOTP:authSession otp:otp audience:audience scope:scope resolve:resolve reject:reject];
}

RCT_EXPORT_METHOD(passkeyEnrollmentChallenge:(NSString *)accessToken
                  userIdentity:(NSString * _Nullable)userIdentity
                  connection:(NSString * _Nullable)connection
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
    [self.myAccount passkeyEnrollmentChallengeWithAccessToken:accessToken userIdentity:userIdentity connection:connection resolve:resolve reject:reject];
}

RCT_EXPORT_METHOD(enrollPasskey:(NSString *)accessToken
                  authenticationMethodId:(NSString *)authenticationMethodId
                  authSession:(NSString *)authSession
                  authResponse:(NSString *)authResponse
                  authParamsPublicKey:(NSString *)authParamsPublicKey
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
    [self.myAccount enrollPasskeyWithAccessToken:accessToken authenticationMethodId:authenticationMethodId authSession:authSession authResponse:authResponse authParamsPublicKey:authParamsPublicKey resolve:resolve reject:reject];
}

RCT_EXPORT_METHOD(getAuthenticationMethods:(NSString *)accessToken
                  type:(NSString * _Nullable)type
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
    [self.myAccount getAuthenticationMethodsWithAccessToken:accessToken type:type resolve:resolve reject:reject];
}

RCT_EXPORT_METHOD(getAuthenticationMethodById:(NSString *)accessToken
                  id:(NSString *)id
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
    [self.myAccount getAuthenticationMethodByIdWithAccessToken:accessToken id:id resolve:resolve reject:reject];
}

RCT_EXPORT_METHOD(updateAuthenticationMethodById:(NSString *)accessToken
                  id:(NSString *)id
                  name:(NSString * _Nullable)name
                  preferredAuthenticationMethod:(NSString * _Nullable)preferredAuthenticationMethod
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
    [self.myAccount updateAuthenticationMethodByIdWithAccessToken:accessToken id:id name:name preferredAuthenticationMethod:preferredAuthenticationMethod resolve:resolve reject:reject];
}

RCT_EXPORT_METHOD(deleteAuthenticationMethodById:(NSString *)accessToken
                  id:(NSString *)id
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
    [self.myAccount deleteAuthenticationMethodByIdWithAccessToken:accessToken id:id resolve:resolve reject:reject];
}

RCT_EXPORT_METHOD(enrollPhone:(NSString *)accessToken
                  phoneNumber:(NSString *)phoneNumber
                  preferredAuthenticationMethod:(NSString * _Nullable)preferredAuthenticationMethod
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
    [self.myAccount enrollPhoneWithAccessToken:accessToken phoneNumber:phoneNumber preferredAuthenticationMethod:preferredAuthenticationMethod resolve:resolve reject:reject];
}

RCT_EXPORT_METHOD(enrollEmail:(NSString *)accessToken
                  emailAddress:(NSString *)emailAddress
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
    [self.myAccount enrollEmailWithAccessToken:accessToken emailAddress:emailAddress resolve:resolve reject:reject];
}

RCT_EXPORT_METHOD(enrollTOTP:(NSString *)accessToken
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
    [self.myAccount enrollTOTPWithAccessToken:accessToken resolve:resolve reject:reject];
}

RCT_EXPORT_METHOD(enrollPushNotification:(NSString *)accessToken
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
    [self.myAccount enrollPushNotificationWithAccessToken:accessToken resolve:resolve reject:reject];
}

RCT_EXPORT_METHOD(enrollRecoveryCode:(NSString *)accessToken
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
    [self.myAccount enrollRecoveryCodeWithAccessToken:accessToken resolve:resolve reject:reject];
}

RCT_EXPORT_METHOD(confirmEnrollmentWithOtp:(NSString *)accessToken
                  id:(NSString *)id
                  authSession:(NSString *)authSession
                  otpCode:(NSString *)otpCode
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
    [self.myAccount confirmEnrollmentWithOtpWithAccessToken:accessToken id:id authSession:authSession otpCode:otpCode resolve:resolve reject:reject];
}

RCT_EXPORT_METHOD(confirmEnrollment:(NSString *)accessToken
                  id:(NSString *)id
                  authSession:(NSString *)authSession
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
    [self.myAccount confirmEnrollmentWithAccessToken:accessToken id:id authSession:authSession resolve:resolve reject:reject];
}

RCT_EXPORT_METHOD(getFactors:(NSString *)accessToken
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
    [self.myAccount getFactorsWithAccessToken:accessToken resolve:resolve reject:reject];
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

- (void)tryAndInitializeNativeBridge:(NSString *)clientId domain:(NSString *)domain withLocalAuthenticationOptions:(NSDictionary*) options useDPoP:(NSNumber *)useDPoP maxRetries:(NSInteger)maxRetries credentialsManagerStorageKey:(NSString * _Nullable)credentialsManagerStorageKey resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
    BOOL useDPoPBool = [useDPoP boolValue];
    NativeBridge *bridge = [[NativeBridge alloc] initWithClientId:clientId domain:domain localAuthenticationOptions:options useDPoP:useDPoPBool maxRetries:maxRetries credentialsManagerStorageKey:credentialsManagerStorageKey resolve:resolve reject:reject];
    self.nativeBridge = bridge;
    self.myAccount = [[A0MyAccount alloc] initWithDomain:domain useDPoP:useDPoPBool];
    self.passwordless = [[A0Passwordless alloc] initWithClientId:clientId domain:domain useDPoP:useDPoPBool];
}
#ifdef RCT_NEW_ARCH_ENABLED
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:(const facebook::react::ObjCTurboModule::InitParams &)params { 
    return std::make_shared<facebook::react::NativeA0Auth0SpecJSI>(params);
}
#endif

@end
