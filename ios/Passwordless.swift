import Auth0
import Foundation

@objc
public class A0Passwordless: NSObject {

    private let clientId: String
    private let domain: String
    private let useDPoP: Bool

    @objc public init(clientId: String, domain: String, useDPoP: Bool) {
        self.clientId = clientId
        self.domain = domain
        self.useDPoP = useDPoP
    }

    private func createClient() -> Authentication {
        var client = Auth0.authentication(clientId: self.clientId, domain: self.domain)
        if self.useDPoP {
            client = client.useDPoP()
        }
        return client
    }

    @objc(challengeWithEmail:connection:allowSignup:resolve:reject:)
    public func challengeWithEmail(email: String, connection: String, allowSignup: Bool, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        createClient().passwordlessChallenge(
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

        createClient().passwordlessChallenge(
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

        createClient().login(
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
