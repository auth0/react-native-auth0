import Auth0
import AuthenticationServices
import Foundation

@objc
public class A0MyAccount: NSObject {

    private let domain: String
    private let useDPoP: Bool

    @objc public init(domain: String, useDPoP: Bool) {
        self.domain = domain
        self.useDPoP = useDPoP
    }

    private func createClient(accessToken: String) -> any MyAccount {
        var client = Auth0.myAccount(token: accessToken, domain: self.domain)
        if self.useDPoP {
            client = client.useDPoP()
        }
        return client
    }

    @objc public func passkeyEnrollmentChallenge(accessToken: String, userIdentity: String?, connection: String?, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        guard #available(iOS 16.6, *) else {
            reject("MY_ACCOUNT_ERROR", "Passkeys require iOS 16.6 or later", nil)
            return
        }

        let myAccount = createClient(accessToken: accessToken)

        let userIdentityValue = userIdentity?.isEmpty == true ? nil : userIdentity
        let connectionValue = connection?.isEmpty == true ? nil : connection

        myAccount.authenticationMethods.passkeyEnrollmentChallenge(
            userIdentityId: userIdentityValue,
            connection: connectionValue
        ).start { result in
            switch result {
            case .success(let challenge):
                let authParamsPublicKey: [String: Any] = [
                    "rp": ["id": challenge.relyingPartyId],
                    "challenge": challenge.challengeData.base64URLEncodedString(),
                    "user": [
                        "id": challenge.userId.base64URLEncodedString(),
                        "name": challenge.userName
                    ]
                ]
                let response: [String: Any] = [
                    "authenticationMethodId": challenge.authenticationMethodId,
                    "authSession": challenge.authenticationSession,
                    "authParamsPublicKey": authParamsPublicKey
                ]
                resolve(response)
            case .failure(let error):
                reject("MY_ACCOUNT_ERROR", error.localizedDescription, error)
            }
        }
    }

    @objc public func enrollPasskey(accessToken: String, authenticationMethodId: String, authSession: String, authResponse: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        guard #available(iOS 16.6, *) else {
            reject("MY_ACCOUNT_ERROR", "Passkeys require iOS 16.6 or later", nil)
            return
        }

        let myAccount = createClient(accessToken: accessToken)

        guard let responseData = authResponse.data(using: .utf8),
              let json = try? JSONSerialization.jsonObject(with: responseData) as? [String: Any],
              let responseDict = json["response"] as? [String: Any],
              let idString = json["id"] as? String,
              let credentialID = Data(base64URLEncoded: idString),
              let clientDataJSONString = responseDict["clientDataJSON"] as? String,
              let clientDataJSON = Data(base64URLEncoded: clientDataJSONString) else {
            reject("MY_ACCOUNT_ERROR", "Invalid authResponse JSON", nil)
            return
        }

        let attachmentString = json["authenticatorAttachment"] as? String ?? "platform"
        let attachment: ASAuthorizationPublicKeyCredentialAttachment = attachmentString == "cross-platform" ? .crossPlatform : .platform

        let attestationObjectString = responseDict["attestationObject"] as? String
        let attestationObject = attestationObjectString.flatMap { Data(base64URLEncoded: $0) }

        let passkey = BridgeSignupPasskey(
            credentialID: credentialID,
            attachment: attachment,
            rawClientDataJSON: clientDataJSON,
            rawAttestationObject: attestationObject
        )

        let challenge = PasskeyEnrollmentChallenge(
            authenticationMethodId: authenticationMethodId,
            authenticationSession: authSession,
            relyingPartyId: self.domain,
            userId: Data(),
            userName: "",
            challengeData: Data()
        )

        myAccount.authenticationMethods.enroll(passkey: passkey, challenge: challenge).start { result in
            switch result {
            case .success(let method):
                let response: [String: Any] = [
                    "id": method.id,
                    "type": method.type,
                    "userIdentityId": method.userIdentityId,
                    "userAgent": method.userAgent as Any,
                    "keyId": method.credential.id,
                    "publicKey": method.credential.publicKey.base64EncodedString(),
                    "userHandle": method.credential.userHandle.base64URLEncodedString(),
                    "credentialDeviceType": method.credential.deviceType.rawValue,
                    "credentialBackedUp": method.credential.isBackedUp,
                    "createdAt": ISO8601DateFormatter().string(from: method.createdAt),
                    "aaguid": method.aaguid,
                    "relyingPartyId": method.relyingPartyIdentifier
                ]
                resolve(response)
            case .failure(let error):
                reject("MY_ACCOUNT_ERROR", error.localizedDescription, error)
            }
        }
    }

    @objc public func getAuthenticationMethods(accessToken: String, type: String?, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        let myAccount = createClient(accessToken: accessToken)

        let methodType = type.flatMap { AuthenticationMethodType(rawValue: $0) }

        myAccount.authenticationMethods.getAuthenticationMethods(type: methodType).start { result in
            switch result {
            case .success(let methods):
                let response = methods.map { self.authenticationMethodToDict($0) }
                resolve(response)
            case .failure(let error):
                reject("MY_ACCOUNT_ERROR", error.localizedDescription, error)
            }
        }
    }

    @objc public func getAuthenticationMethod(accessToken: String, id: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        let myAccount = createClient(accessToken: accessToken)

        myAccount.authenticationMethods.getAuthenticationMethod(by: id).start { result in
            switch result {
            case .success(let method):
                resolve(self.authenticationMethodToDict(method))
            case .failure(let error):
                reject("MY_ACCOUNT_ERROR", error.localizedDescription, error)
            }
        }
    }

    @objc public func updateAuthenticationMethod(accessToken: String, id: String, name: String?, preferredAuthenticationMethod: String?, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        let myAccount = createClient(accessToken: accessToken)

        let nameValue = name?.isEmpty == true ? nil : name
        let preferredMethod = preferredAuthenticationMethod.flatMap { PreferredAuthenticationMethod(rawValue: $0) }

        myAccount.authenticationMethods.updateAuthenticationMethod(by: id, name: nameValue, preferredAuthenticationMethod: preferredMethod).start { result in
            switch result {
            case .success(let method):
                resolve(self.authenticationMethodToDict(method))
            case .failure(let error):
                reject("MY_ACCOUNT_ERROR", error.localizedDescription, error)
            }
        }
    }

    @objc public func deleteAuthenticationMethod(accessToken: String, id: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        let myAccount = createClient(accessToken: accessToken)

        myAccount.authenticationMethods.deleteAuthenticationMethod(by: id).start { result in
            switch result {
            case .success:
                resolve(nil)
            case .failure(let error):
                reject("MY_ACCOUNT_ERROR", error.localizedDescription, error)
            }
        }
    }

    // MARK: - Factor Enrollment

    @objc public func enrollPhone(accessToken: String, phoneNumber: String, preferredAuthenticationMethod: String?, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        let myAccount = createClient(accessToken: accessToken)
        let preferredMethod = preferredAuthenticationMethod.flatMap { PreferredAuthenticationMethod(rawValue: $0) }

        myAccount.authenticationMethods.enrollPhone(phoneNumber: phoneNumber, preferredAuthenticationMethod: preferredMethod).start { result in
            switch result {
            case .success(let challenge):
                let response: [String: Any] = [
                    "id": challenge.authenticationId,
                    "authSession": challenge.authenticationSession
                ]
                resolve(response)
            case .failure(let error):
                reject("MY_ACCOUNT_ENROLLMENT_FAILED", error.localizedDescription, error)
            }
        }
    }

    @objc public func enrollEmail(accessToken: String, emailAddress: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        let myAccount = createClient(accessToken: accessToken)

        myAccount.authenticationMethods.enrollEmail(emailAddress: emailAddress).start { result in
            switch result {
            case .success(let challenge):
                let response: [String: Any] = [
                    "id": challenge.authenticationId,
                    "authSession": challenge.authenticationSession
                ]
                resolve(response)
            case .failure(let error):
                reject("MY_ACCOUNT_ENROLLMENT_FAILED", error.localizedDescription, error)
            }
        }
    }

    @objc public func enrollTOTP(accessToken: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        let myAccount = createClient(accessToken: accessToken)

        myAccount.authenticationMethods.enrollTOTP().start { result in
            switch result {
            case .success(let challenge):
                var response: [String: Any] = [
                    "id": challenge.authenticationId,
                    "authSession": challenge.authenticationSession,
                    "barcodeUri": challenge.authenticatorQRCodeURI
                ]
                if let manualCode = challenge.authenticatorManualInputCode {
                    response["manualInputCode"] = manualCode
                }
                resolve(response)
            case .failure(let error):
                reject("MY_ACCOUNT_ENROLLMENT_FAILED", error.localizedDescription, error)
            }
        }
    }

    @objc public func enrollPushNotification(accessToken: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        let myAccount = createClient(accessToken: accessToken)

        myAccount.authenticationMethods.enrollPushNotification().start { result in
            switch result {
            case .success(let challenge):
                var response: [String: Any] = [
                    "id": challenge.authenticationId,
                    "authSession": challenge.authenticationSession,
                    "barcodeUri": challenge.authenticatorQRCodeURI
                ]
                if let manualCode = challenge.authenticatorManualInputCode {
                    response["manualInputCode"] = manualCode
                }
                resolve(response)
            case .failure(let error):
                reject("MY_ACCOUNT_ENROLLMENT_FAILED", error.localizedDescription, error)
            }
        }
    }

    @objc public func enrollRecoveryCode(accessToken: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        let myAccount = createClient(accessToken: accessToken)

        myAccount.authenticationMethods.enrollRecoveryCode().start { result in
            switch result {
            case .success(let challenge):
                let response: [String: Any] = [
                    "id": challenge.authenticationId,
                    "authSession": challenge.authenticationSession,
                    "recoveryCode": challenge.recoveryCode
                ]
                resolve(response)
            case .failure(let error):
                reject("MY_ACCOUNT_ENROLLMENT_FAILED", error.localizedDescription, error)
            }
        }
    }

    // MARK: - Enrollment Confirmation

    @objc public func confirmEnrollmentWithOtp(accessToken: String, id: String, authSession: String, otpCode: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        let myAccount = createClient(accessToken: accessToken)

        myAccount.authenticationMethods.confirmPhoneEnrollment(id: id, authSession: authSession, otpCode: otpCode).start { result in
            switch result {
            case .success(let method):
                resolve(self.authenticationMethodToDict(method))
            case .failure(let error):
                reject("MY_ACCOUNT_VERIFICATION_FAILED", error.localizedDescription, error)
            }
        }
    }

    @objc public func confirmEnrollment(accessToken: String, id: String, authSession: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        let myAccount = createClient(accessToken: accessToken)

        myAccount.authenticationMethods.confirmRecoveryCodeEnrollment(id: id, authSession: authSession).start { result in
            switch result {
            case .success(let method):
                resolve(self.authenticationMethodToDict(method))
            case .failure(let error):
                reject("MY_ACCOUNT_VERIFICATION_FAILED", error.localizedDescription, error)
            }
        }
    }

    // MARK: - Factors

    @objc public func getFactors(accessToken: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        let myAccount = createClient(accessToken: accessToken)

        myAccount.authenticationMethods.getFactors().start { result in
            switch result {
            case .success(let factors):
                let response = factors.map { factor -> [String: Any?] in
                    return [
                        "type": factor.type,
                        "usage": factor.usage
                    ]
                }
                resolve(response)
            case .failure(let error):
                reject("MY_ACCOUNT_ERROR", error.localizedDescription, error)
            }
        }
    }

    // MARK: - Helpers

    private func authenticationMethodToDict(_ method: Auth0.AuthenticationMethod) -> [String: Any?] {
        return [
            "id": method.id,
            "type": method.type,
            "createdAt": method.createdAt,
            "usage": method.usage,
            "confirmed": method.confirmed,
            "name": method.name,
            "keyId": method.keyId,
            "publicKey": method.publicKey,
            "userHandle": method.userHandle,
            "credentialDeviceType": method.credentialDeviceType,
            "credentialBackedUp": method.credentialBackedUp,
            "userAgent": method.userAgent,
            "identityUserId": method.identityUserId,
            "transports": method.transports,
            "phoneNumber": method.phoneNumber,
            "preferredAuthenticationMethod": method.preferredAuthenticationMethod,
            "lastPasswordReset": method.lastPasswordReset,
        ]
    }
}
