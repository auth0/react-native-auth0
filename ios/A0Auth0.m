
#import "A0Auth0.h"

#import <SafariServices/SafariServices.h>
#import <CommonCrypto/CommonCrypto.h>

#if __has_include("RCTUtils.h")
#import "RCTUtils.h"
#else
#import <React/RCTUtils.h>
#endif

@interface A0Auth0 () <SFSafariViewControllerDelegate>
@property (weak, nonatomic) SFSafariViewController *last;
@property (copy, nonatomic) RCTResponseSenderBlock sessionCallback;
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

RCT_EXPORT_METHOD(showUrl:(NSString *)urlString callback:(RCTResponseSenderBlock)callback) {
    NSURL *url = [NSURL URLWithString:urlString];
    UIWindow *window = [[UIApplication sharedApplication] keyWindow];
    SFSafariViewController *controller = [[SFSafariViewController alloc] initWithURL:url];
    controller.delegate = self;
    [self terminateWithError:RCTMakeError(@"Only one Safari can be visible", nil, nil) dismissing:YES animated:NO];
    [window.rootViewController presentViewController:controller animated:YES completion:nil];
    self.last = controller;
    self.sessionCallback = callback;
}

RCT_EXPORT_METHOD(oauthParameters:(RCTResponseSenderBlock)callback) {
    callback(@[[self generateOAuthParameters]]);
}

- (NSDictionary *)constantsToExport {
  return @{ @"bundleIdentifier": [[NSBundle mainBundle] bundleIdentifier] };
}

#pragma mark - Internal methods

- (void)terminateWithError:(id)error dismissing:(BOOL)dismissing animated:(BOOL)animated {
    RCTResponseSenderBlock callback = self.sessionCallback ? self.sessionCallback : ^void(NSArray *_unused) {};
    if (dismissing) {
        [self.last.presentingViewController dismissViewControllerAnimated:animated
                                                        completion:^{
                                                            if (error) {
                                                                callback(@[error]);
                                                            }
                                                        }];
    } else if (error) {
        callback(@[error]);
    }
    self.sessionCallback = nil;
    self.last = nil;
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
    NSString *bundleIdentifier = [[NSBundle mainBundle] bundleIdentifier];
    return @{
        @"verifier": verifier,
        @"code_challenge": [self sign:verifier],
        @"code_challenge_method": @"S256",
        @"state": [self randomValue]
    };
}

#pragma mark - SFSafariViewControllerDelegate

- (void)safariViewControllerDidFinish:(SFSafariViewController *)controller {
    [self terminateWithError:RCTMakeError(@"User closed Safari", nil, nil) dismissing:NO animated:NO];
}

- (void)safariViewController:(SFSafariViewController *)controller didCompleteInitialLoad:(BOOL)didLoadSuccessfully {
    if (!didLoadSuccessfully) {
        [self terminateWithError:RCTMakeError(@"Failed to load hosted login page", nil, nil) dismissing:YES animated:YES];
    }
}
@end
