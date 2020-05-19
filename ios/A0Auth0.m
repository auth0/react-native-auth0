#import "A0Auth0.h"

#import <SafariServices/SafariServices.h>
#if __has_include("AuthenticationServices/AuthenticationServices.h")
#import <AuthenticationServices/AuthenticationServices.h>
#endif
#import <CommonCrypto/CommonCrypto.h>

#if __has_include("RCTUtils.h")
#import "RCTUtils.h"
#else
#import <React/RCTUtils.h>
#endif

#define ERROR_CANCELLED @{@"error": @"a0.session.user_cancelled",@"error_description": @"User cancelled the Auth"}
#define ERROR_FAILED_TO_LOAD @{@"error": @"a0.session.failed_load",@"error_description": @"Failed to load url"}

#if __IPHONE_OS_VERSION_MAX_ALLOWED >= 130000
@interface A0Auth0 () <SFSafariViewControllerDelegate, ASWebAuthenticationPresentationContextProviding>
@end
#else
@interface A0Auth0 () <SFSafariViewControllerDelegate>
@end
#endif

@interface A0Auth0 () <SFSafariViewControllerDelegate>
@property (weak, nonatomic) SFSafariViewController *last;
@property (strong, nonatomic) NSObject *authenticationSession;
@property (copy, nonatomic) RCTResponseSenderBlock sessionCallback;
@property (assign, nonatomic) BOOL closeOnLoad;
@end

@implementation A0Auth0

- (dispatch_queue_t)methodQueue
{
    return dispatch_get_main_queue();
}

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(hide) {
    [self terminateWithError:nil dismissing:YES animated:YES];
}

RCT_EXPORT_METHOD(showUrl:(NSString *)urlString
                  usingEphemeralSession:(BOOL)ephemeralSession
                  closeOnLoad:(BOOL)closeOnLoad
                  callback:(RCTResponseSenderBlock)callback) {
    if (@available(iOS 11.0, *)) {
        self.sessionCallback = callback;
        self.closeOnLoad = closeOnLoad;
        [self presentAuthenticationSession:[NSURL URLWithString:urlString] usingEphemeralSession:ephemeralSession];
    } else {
        [self presentSafariWithURL:[NSURL URLWithString:urlString]];
        self.sessionCallback = callback;
        self.closeOnLoad = closeOnLoad;
    }
}

RCT_EXPORT_METHOD(oauthParameters:(RCTResponseSenderBlock)callback) {
    callback(@[[self generateOAuthParameters]]);
}

- (NSDictionary *)constantsToExport {
    return @{ @"bundleIdentifier": [[NSBundle mainBundle] bundleIdentifier] };
}

+ (BOOL)requiresMainQueueSetup {
    return YES;
}

#pragma mark - Internal methods

UIBackgroundTaskIdentifier taskId;

- (void)presentSafariWithURL:(NSURL *)url {
    UIWindow *window = [[UIApplication sharedApplication] keyWindow];
    SFSafariViewController *controller = [[SFSafariViewController alloc] initWithURL:url];
    controller.delegate = self;
    [self terminateWithError:RCTMakeError(@"Only one Safari can be visible", nil, nil) dismissing:YES animated:NO];
    [[self topViewControllerWithRootViewController:window.rootViewController] presentViewController:controller animated:YES completion:nil];
    self.last = controller;
}

- (void)presentAuthenticationSession:(NSURL *)url usingEphemeralSession:(BOOL)ephemeralSession {
    
    NSURLComponents *urlComponents = [NSURLComponents componentsWithURL:url
                                                resolvingAgainstBaseURL:NO];
    NSArray *queryItems = urlComponents.queryItems;
    NSPredicate *predicate = [NSPredicate predicateWithFormat:@"name=%@", @"redirect_uri"];
    NSURLQueryItem *queryItem = [[queryItems
                                  filteredArrayUsingPredicate:predicate]
                                 firstObject];
    NSString *callbackURLScheme = queryItem.value;
    RCTResponseSenderBlock callback = self.sessionCallback ? self.sessionCallback : ^void(NSArray *_unused) {};

    if (@available(iOS 12.0, *)) {
        taskId = [UIApplication.sharedApplication beginBackgroundTaskWithExpirationHandler:^{
            [UIApplication.sharedApplication endBackgroundTask:taskId];
            taskId = UIBackgroundTaskInvalid;
        }];
        ASWebAuthenticationSession* authenticationSession = [[ASWebAuthenticationSession alloc]
                                      initWithURL:url callbackURLScheme:callbackURLScheme
                                      completionHandler:^(NSURL * _Nullable callbackURL,
                                                          NSError * _Nullable error) {
                                          if ([[error domain] isEqualToString:ASWebAuthenticationSessionErrorDomain] &&
                                              [error code] == ASWebAuthenticationSessionErrorCodeCanceledLogin) {
                                              callback(@[ERROR_CANCELLED, [NSNull null]]);
                                          } else if(error) {
                                              callback(@[error, [NSNull null]]);
                                          } else if(callbackURL) {
                                              callback(@[[NSNull null], callbackURL.absoluteString]);
                                          }
                                          self.authenticationSession = nil;
                                          [UIApplication.sharedApplication endBackgroundTask:taskId];
                                          taskId = UIBackgroundTaskInvalid;
                                      }];
        #if __IPHONE_OS_VERSION_MAX_ALLOWED >= 130000
        if (@available(iOS 13.0, *)) {
            authenticationSession.presentationContextProvider = self;
            authenticationSession.prefersEphemeralWebBrowserSession = ephemeralSession;
        }
        #endif
        self.authenticationSession = authenticationSession;
        [(ASWebAuthenticationSession*) self.authenticationSession start];
    } else if (@available(iOS 11.0, *)) {
        taskId = [UIApplication.sharedApplication beginBackgroundTaskWithExpirationHandler:^{
            [UIApplication.sharedApplication endBackgroundTask:taskId];
            taskId = UIBackgroundTaskInvalid;
        }];
        self.authenticationSession = [[SFAuthenticationSession alloc]
                                      initWithURL:url callbackURLScheme:callbackURLScheme
                                      completionHandler:^(NSURL * _Nullable callbackURL,
                                                          NSError * _Nullable error) {
                                          if ([[error domain] isEqualToString:SFAuthenticationErrorDomain] &&
                                              [error code] == SFAuthenticationErrorCanceledLogin) {
                                              callback(@[ERROR_CANCELLED, [NSNull null]]);
                                          } else if(error) {
                                              callback(@[error, [NSNull null]]);
                                          } else if(callbackURL) {
                                              callback(@[[NSNull null], callbackURL.absoluteString]);
                                          }
                                          self.authenticationSession = nil;
                                          [UIApplication.sharedApplication endBackgroundTask:taskId];
                                          taskId = UIBackgroundTaskInvalid;
                                      }];
        [(SFAuthenticationSession*) self.authenticationSession start];
    }
}

- (void)terminateWithError:(id)error dismissing:(BOOL)dismissing animated:(BOOL)animated {
    RCTResponseSenderBlock callback = self.sessionCallback ? self.sessionCallback : ^void(NSArray *_unused) {};
    if (dismissing) {
        [self.last.presentingViewController dismissViewControllerAnimated:animated
                                                               completion:^{
                                                                   if (error) {
                                                                       callback(@[error, [NSNull null]]);
                                                                   }
                                                               }];
    } else if (error) {
        callback(@[error, [NSNull null]]);
    }
    self.sessionCallback = nil;
    self.last = nil;
    self.closeOnLoad = NO;
}

- (NSString *)randomValue {
    NSMutableData *data = [NSMutableData dataWithLength:32];
    int result __attribute__((unused)) = SecRandomCopyBytes(kSecRandomDefault, 32, data.mutableBytes);
    NSString *value = [[[[data base64EncodedStringWithOptions:0]
                         stringByReplacingOccurrencesOfString:@"+" withString:@"-"]
                        stringByReplacingOccurrencesOfString:@"/" withString:@"_"]
                       stringByTrimmingCharactersInSet:[NSCharacterSet characterSetWithCharactersInString:@"="]];
    return value;
}

- (NSString *)sign:(NSString*)value {
    CC_SHA256_CTX ctx;

    uint8_t * hashBytes = malloc(CC_SHA256_DIGEST_LENGTH * sizeof(uint8_t));
    memset(hashBytes, 0x0, CC_SHA256_DIGEST_LENGTH);

    NSData *valueData = [value dataUsingEncoding:NSUTF8StringEncoding];

    CC_SHA256_Init(&ctx);
    CC_SHA256_Update(&ctx, [valueData bytes], (CC_LONG)[valueData length]);
    CC_SHA256_Final(hashBytes, &ctx);

    NSData *hash = [NSData dataWithBytes:hashBytes length:CC_SHA256_DIGEST_LENGTH];

    if (hashBytes) {
        free(hashBytes);
    }

    return [[[[hash base64EncodedStringWithOptions:0]
              stringByReplacingOccurrencesOfString:@"+" withString:@"-"]
             stringByReplacingOccurrencesOfString:@"/" withString:@"_"]
            stringByTrimmingCharactersInSet:[NSCharacterSet characterSetWithCharactersInString:@"="]];
}

- (NSDictionary *)generateOAuthParameters {
    NSString *verifier = [self randomValue];
    return @{
             @"verifier": verifier,
             @"code_challenge": [self sign:verifier],
             @"code_challenge_method": @"S256",
             @"state": [self randomValue]
             };
}

#pragma mark - SFSafariViewControllerDelegate

- (void)safariViewControllerDidFinish:(SFSafariViewController *)controller {
    [self terminateWithError:ERROR_CANCELLED dismissing:NO animated:NO];
}

- (void)safariViewController:(SFSafariViewController *)controller didCompleteInitialLoad:(BOOL)didLoadSuccessfully {
    if (self.closeOnLoad && didLoadSuccessfully) {
        [self terminateWithError:[NSNull null] dismissing:YES animated:YES];
    } else if (!didLoadSuccessfully) {
        [self terminateWithError:ERROR_FAILED_TO_LOAD dismissing:YES animated:YES];
    }
}

# pragma mark - Utility

- (UIViewController*)topViewControllerWithRootViewController:(UIViewController*)rootViewController {
    if ([rootViewController isKindOfClass:[UITabBarController class]]) {
        UITabBarController* tabBarController = (UITabBarController*)rootViewController;
        return [self topViewControllerWithRootViewController:tabBarController.selectedViewController];
    } else if ([rootViewController isKindOfClass:[UINavigationController class]]) {
        UINavigationController* navigationController = (UINavigationController*)rootViewController;
        return [self topViewControllerWithRootViewController:navigationController.visibleViewController];
    } else if (rootViewController.presentedViewController) {
        UIViewController* presentedViewController = rootViewController.presentedViewController;
        return [self topViewControllerWithRootViewController:presentedViewController];
    } else {
        return rootViewController;
    }
}

#if __IPHONE_OS_VERSION_MAX_ALLOWED >= 130000
#pragma mark - ASWebAuthenticationPresentationContextProviding

- (ASPresentationAnchor)presentationAnchorForWebAuthenticationSession:(ASWebAuthenticationSession *)session API_AVAILABLE(ios(13.0)){
    return [UIApplication sharedApplication].keyWindow;
}
#endif

@end
