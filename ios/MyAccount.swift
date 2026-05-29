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

    private func rejectWithMyAccountError(reject: @escaping RCTPromiseRejectBlock, error: MyAccountError) {
        let code = error.code
        let info: [String: Any] = [
            "type": error.code,
            "title": error.title,
            "detail": error.detail,
            "statusCode": error.statusCode
        ]
        let message: String
        if let data = try? JSONSerialization.data(withJSONObject: info),
           let json = String(data: data, encoding: .utf8) {
            message = json
        } else {
            message = error.localizedDescription
        }
        reject(code, message, error)
    }

    @objc public func passkeyEnrollmentChallenge(accessToken: String, userIdentity: String?, connection: String?, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        guard #available(iOS 16.6, *) else {
            reject("PASSKEYS_NOT_SUPPORTED", "Passkeys require iOS 16.6 or later", nil)
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
                self.rejectWithMyAccountError(reject: reject, error: error)
            }
        }
    }

    @objc public func enrollPasskey(accessToken: String, authenticationMethodId: String, authSession: String, authResponse: String, authParamsPublicKey: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        guard #available(iOS 16.6, *) else {
            reject("PASSKEYS_NOT_SUPPORTED", "Passkeys require iOS 16.6 or later", nil)
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

        guard let authParamsData = authParamsPublicKey.data(using: .utf8),
              let authParams = try? JSONSerialization.jsonObject(with: authParamsData) as? [String: Any] else {
            reject("MY_ACCOUNT_ERROR", "Invalid authParamsPublicKey JSON", nil)
            return
        }

        let relyingPartyId = (authParams["rp"] as? [String: Any])?["id"] as? String ?? self.domain
        var challengeData = Data()
        var userId = Data()
        var userName = ""

        if let challengeStr = authParams["challenge"] as? String, let data = Data(base64URLEncoded: challengeStr) {
            challengeData = data
        }
        if let user = authParams["user"] as? [String: Any] {
            if let userIdStr = user["id"] as? String, let data = Data(base64URLEncoded: userIdStr) {
                userId = data
            }
            if let name = user["name"] as? String {
                userName = name
            }
        }

        let challenge = PasskeyEnrollmentChallenge(
            authenticationMethodId: authenticationMethodId,
            authenticationSession: authSession,
            relyingPartyId: relyingPartyId,
            userId: userId,
            userName: userName,
            challengeData: challengeData
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
                self.rejectWithMyAccountError(reject: reject, error: error)
            }
        }
    }

    @objc public func getAuthenticationMethods(accessToken: String, type: String?, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        let myAccount = createClient(accessToken: accessToken)

        var methodType: AuthenticationMethodType? = nil
        if let typeStr = type, !typeStr.isEmpty {
            guard let parsed = AuthenticationMethodType(rawValue: typeStr) else {
                reject("MY_ACCOUNT_ERROR", "Invalid authentication method type: \(typeStr)", nil)
                return
            }
            methodType = parsed
        }

        myAccount.authenticationMethods.getAuthenticationMethods(type: methodType).start { result in
            switch result {
            case .success(let methods):
                let response = methods.map { self.authenticationMethodToDict($0) }
                resolve(response)
            case .failure(let error):
                self.rejectWithMyAccountError(reject: reject, error: error)
            }
        }
    }

    @objc public func getAuthenticationMethodById(accessToken: String, id: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        let myAccount = createClient(accessToken: accessToken)

        myAccount.authenticationMethods.getAuthenticationMethod(by: id).start { result in
            switch result {
            case .success(let method):
                resolve(self.authenticationMethodToDict(method))
            case .failure(let error):
                self.rejectWithMyAccountError(reject: reject, error: error)
            }
        }
    }

    @objc public func updateAuthenticationMethodById(accessToken: String, id: String, name: String?, preferredAuthenticationMethod: String?, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        let myAccount = createClient(accessToken: accessToken)

        let nameValue = name?.isEmpty == true ? nil : name
        var preferredMethod: PreferredAuthenticationMethod? = nil
        if let methodStr = preferredAuthenticationMethod, !methodStr.isEmpty {
            guard let parsed = PreferredAuthenticationMethod(rawValue: methodStr) else {
                reject("MY_ACCOUNT_ERROR", "Invalid preferred authentication method: \(methodStr)", nil)
                return
            }
            preferredMethod = parsed
        }

        myAccount.authenticationMethods.updateAuthenticationMethod(by: id, name: nameValue, preferredAuthenticationMethod: preferredMethod).start { result in
            switch result {
            case .success(let method):
                resolve(self.authenticationMethodToDict(method))
            case .failure(let error):
                self.rejectWithMyAccountError(reject: reject, error: error)
            }
        }
    }

    @objc public func deleteAuthenticationMethodById(accessToken: String, id: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        let myAccount = createClient(accessToken: accessToken)

        myAccount.authenticationMethods.deleteAuthenticationMethod(by: id).start { result in
            switch result {
            case .success:
                resolve(nil)
            case .failure(let error):
                self.rejectWithMyAccountError(reject: reject, error: error)
            }
        }
    }

    // MARK: - Factor Enrollment

    @objc public func enrollPhone(accessToken: String, phoneNumber: String, preferredAuthenticationMethod: String?, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        let myAccount = createClient(accessToken: accessToken)

        var preferredMethod: PreferredAuthenticationMethod? = nil
        if let methodStr = preferredAuthenticationMethod, !methodStr.isEmpty {
            guard let parsed = PreferredAuthenticationMethod(rawValue: methodStr) else {
                reject("MY_ACCOUNT_ENROLLMENT_FAILED", "Invalid preferred authentication method: \(methodStr)", nil)
                return
            }
            preferredMethod = parsed
        }

        myAccount.authenticationMethods.enrollPhone(phoneNumber: phoneNumber, preferredAuthenticationMethod: preferredMethod).start { result in
            switch result {
            case .success(let challenge):
                let response: [String: Any] = [
                    "id": challenge.authenticationId,
                    "authSession": challenge.authenticationSession
                ]
                resolve(response)
            case .failure(let error):
                self.rejectWithMyAccountError(reject: reject, error: error)
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
                self.rejectWithMyAccountError(reject: reject, error: error)
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
                self.rejectWithMyAccountError(reject: reject, error: error)
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
                self.rejectWithMyAccountError(reject: reject, error: error)
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
                self.rejectWithMyAccountError(reject: reject, error: error)
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
                self.rejectWithMyAccountError(reject: reject, error: error)
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
                self.rejectWithMyAccountError(reject: reject, error: error)
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
                self.rejectWithMyAccountError(reject: reject, error: error)
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
