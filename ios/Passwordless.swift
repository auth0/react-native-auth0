import Auth0
import Foundation

@objc
public class A0Passwordless: NSObject {

    private let client: Authentication

    @objc public init(clientId: String, domain: String, useDPoP: Bool) {
        var client = Auth0.authentication(clientId: clientId, domain: domain)
        if useDPoP {
            client = client.useDPoP()
        }
        self.client = client
    }

    @objc(challengeWithEmail:connection:allowSignup:resolve:reject:)
    public func challengeWithEmail(email: String, connection: String, allowSignup: Bool, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        client.passwordlessChallenge(
            email: email,
            connection: connection,
            allowSignup: allowSignup
        ).start { result in
            switch result {
            case .success(let challenge):
                resolve(["authSession": challenge.authSession])
            case .failure(let error):
                reject("PASSWORDLESS_CHALLENGE_FAILED", error.localizedDescription, error)
            }
        }
    }

    @objc(challengeWithPhoneNumber:connection:deliveryMethod:allowSignup:resolve:reject:)
    public func challengeWithPhoneNumber(phoneNumber: String, connection: String, deliveryMethod: String, allowSignup: Bool, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        let method = DeliveryMethod(rawValue: deliveryMethod) ?? .text

        client.passwordlessChallenge(
            phoneNumber: phoneNumber,
            connection: connection,
            deliveryMethod: method,
            allowSignup: allowSignup
        ).start { result in
            switch result {
            case .success(let challenge):
                resolve(["authSession": challenge.authSession])
            case .failure(let error):
                reject("PASSWORDLESS_CHALLENGE_FAILED", error.localizedDescription, error)
            }
        }
    }

    @objc(loginWithOTP:otp:audience:scope:resolve:reject:)
    public func loginWithOTP(authSession: String, otp: String, audience: String?, scope: String?, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        let audienceValue = audience?.isEmpty == true ? nil : audience
        let finalScope = scope?.isEmpty == true ? "openid profile email" : (scope ?? "openid profile email")

        // PasswordlessChallenge has no public initializer, but it is Codable with
        // `authSession` mapped to the `auth_session` JSON key. Reconstruct it by decoding.
        guard let challengeData = try? JSONSerialization.data(withJSONObject: ["auth_session": authSession]),
              let challenge = try? JSONDecoder().decode(PasswordlessChallenge.self, from: challengeData) else {
            reject("PASSWORDLESS_LOGIN_FAILED", "Invalid passwordless challenge", nil)
            return
        }

        client.login(
            otp: otp,
            challenge: challenge,
            audience: audienceValue,
            scope: finalScope
        ).start { result in
            switch result {
            case .success(let credentials):
                resolve(credentials.asDictionary())
            case .failure(let error):
                reject("PASSWORDLESS_LOGIN_FAILED", error.localizedDescription, error)
            }
        }
    }
}
