//
//  NativeBridge.swift
//  A0Auth0
//
//  Created by Poovamraj T T on 15/06/23.
//  Copyright © 2023 Facebook. All rights reserved.
//

import Auth0
import AuthenticationServices
import Foundation
import LocalAuthentication
import SimpleKeychain

@objc
public class NativeBridge: NSObject {
    
    static let accessTokenKey = "accessToken";
    static let idTokenKey = "idToken";
    static let expiresAtKey = "expiresAt";
    static let scopeKey = "scope";
    static let refreshTokenKey = "refreshToken";
    static let typeKey = "type";
    static let tokenTypeKey = "tokenType";
    static let dateFormat = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'";
    
    static let credentialsManagerErrorCode = "CREDENTIAL_MANAGER_ERROR"
    static let biometricsAuthenticationErrorCode = "BIOMETRICS_CONFIGURATION_ERROR"
    
    // DPoP error codes
    static let dpopErrorCode = "DPOP_ERROR"
    static let dpopKeyGenerationFailedCode = "DPOP_KEY_GENERATION_FAILED"
    static let dpopKeyStorageFailedCode = "DPOP_KEY_STORAGE_FAILED"
    static let dpopKeyRetrievalFailedCode = "DPOP_KEY_RETRIEVAL_FAILED"
    static let dpopKeyNotFoundCode = "DPOP_KEY_NOT_FOUND"
    static let dpopKeychainErrorCode = "DPOP_KEYCHAIN_ERROR"
    static let dpopGenerationFailedCode = "DPOP_GENERATION_FAILED"
    static let dpopProofFailedCode = "DPOP_PROOF_FAILED"
    static let dpopNonceMismatchCode = "DPOP_NONCE_MISMATCH"
    static let dpopInvalidTokenTypeCode = "DPOP_INVALID_TOKEN_TYPE"
    static let dpopMissingParameterCode = "DPOP_MISSING_PARAMETER"
    static let dpopClearKeyFailedCode = "DPOP_CLEAR_KEY_FAILED"
    
    var credentialsManager: CredentialsManager
    var clientId: String
    var domain: String
    var useDPoP: Bool
    var maxRetries: Int
    private(set) lazy var mfaClient: A0MfaClient = {
        A0MfaClient(clientId: self.clientId, domain: self.domain, useDPoP: self.useDPoP)
    }()
    
    @objc public init(clientId: String, domain: String, localAuthenticationOptions: [String: Any]?, useDPoP: Bool, maxRetries: Int, credentialsManagerStorageKey: String?, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        var auth0 = Auth0
            .authentication(clientId: clientId, domain: domain)
        self.clientId = clientId
        self.domain = domain
        self.useDPoP = useDPoP
        self.maxRetries = maxRetries
        if self.useDPoP {
            auth0 = auth0.useDPoP()
        }
        // Namespace the keychain per client when a storage key is provided, else use the default service.
        if let key = credentialsManagerStorageKey, !key.isEmpty {
            self.credentialsManager = CredentialsManager(authentication: auth0, storage: SimpleKeychain(service: key), maxRetries: maxRetries)
        } else {
            self.credentialsManager = CredentialsManager(authentication: auth0, maxRetries: maxRetries)
        }
        super.init()
        if let localAuthenticationOptions = localAuthenticationOptions {
            if let title = localAuthenticationOptions["title"] as? String {
                var evaluationPolicy = LAPolicy.deviceOwnerAuthenticationWithBiometrics
                if let evaluationPolicyInt = localAuthenticationOptions["evaluationPolicy"] as? Int {
                    evaluationPolicy = convert(policyInt: evaluationPolicyInt)
                }

                // Parse biometric policy
                var biometricPolicy = BiometricPolicy.default
                if let policyString = localAuthenticationOptions["biometricPolicy"] as? String {
                    let timeout = localAuthenticationOptions["biometricTimeout"] as? Int ?? 3600
                    biometricPolicy = convert(policyString: policyString, timeout: timeout)
                }

                self.credentialsManager.enableBiometrics(withTitle: title, cancelTitle: localAuthenticationOptions["cancelTitle"] as? String, fallbackTitle: localAuthenticationOptions["fallbackTitle"] as? String, evaluationPolicy: evaluationPolicy, policy: biometricPolicy)
                resolve(true)
                return
            } else {
                reject(NativeBridge.biometricsAuthenticationErrorCode, "Missing mandatory property title in LocalAuthenticationOptions, hence biometrics authentication cannot be enabled", nil)
                return
            }
        }
        resolve(true)
   }
    
    @objc public func webAuth(scheme: String, state: String?, redirectUri: String, nonce: String?, audience: String?, scope: String?, connection: String?, maxAge: Int, organization: String?, invitationUrl: String?, leeway: Int, ephemeralSession: Bool, safariViewControllerPresentationStyle: Int, additionalParameters: [String: String], resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        var builder = Auth0.webAuth(clientId: self.clientId, domain: self.domain)
        if self.useDPoP {
            builder = builder.useDPoP()
        }
        if let value = URL(string: redirectUri) {
            let _ = builder.redirectURL(value)
        }
        if let value = state {
            let _ = builder.state(value)
        }
        if let value = nonce {
            let _ = builder.nonce(value)
        }
        if let value = audience {
            let _ = builder.audience(value)
        }
        if let value = scope {
            let _ = builder.scope(value)
        }
        if let value = connection {
            let _ = builder.connection(value)
        }
        if(maxAge != 0) {
            let _ = builder.maxAge(maxAge)
        }
        if let value = organization {
            let _ = builder.organization(value)
        }
        if let value = invitationUrl, let invitationURL = URL(string: value) {
            let _ = builder.invitationURL(invitationURL)
        }
        if(leeway != 0) {
            let _ = builder.leeway(leeway)
        }
        if(ephemeralSession) {
            let _ = builder.useEphemeralSession()
        }
        
        // Check if scheme starts with https and use HTTPS if it does
        if scheme.starts(with: "https") {
            let _ = builder.useHTTPS()
        }
        
        //Since we cannot have a null value here, the JS layer sends 99 if we have to ignore setting this value
        if let presentationStyle = UIModalPresentationStyle(rawValue: safariViewControllerPresentationStyle), safariViewControllerPresentationStyle != 99 {
            let _ = builder.provider(WebAuthentication.safariProvider(style: presentationStyle))
        }
        let _ = builder
            .parameters(additionalParameters)
        builder.start { result in
            switch result {
            case .success(let credentials):
                resolve(credentials.asDictionary())
            case .failure(let error):
                reject(error.reactNativeErrorCode(), error.errorDescription, error)
            }
        }
    }

    @objc public func webAuthLogout(scheme: String, federated: Bool, redirectUri: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        let builder = Auth0.webAuth(clientId: self.clientId, domain: self.domain)
        if let value = URL(string: redirectUri) {
            let _ = builder.redirectURL(value)
        }
        
        // Check if scheme starts with https and use HTTPS if it does
        if scheme.starts(with: "https") {
            let _ = builder.useHTTPS()
        }
        
        builder.clearSession(federated: federated) { result in
                switch result {
                case .success:
                    resolve(true)
                case .failure(let error):
                    reject(error.reactNativeErrorCode(), error.errorDescription, error)
                }
            }
    }

    @objc public func resumeWebAuth(url: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        if let value = URL(string: url), WebAuthentication.resume(with: value) {
            resolve(true)
        } else {
            reject("ERROR_PARSING_URL", "The callback url \(url) is invalid", nil)
        }
    }
    
    @objc public func cancelWebAuth(resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        resolve(WebAuthentication.cancel())
    }
    
    @objc public func saveCredentials(credentialsDict: [String: Any], resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        
        guard let accessToken = credentialsDict[NativeBridge.accessTokenKey] as? String, let tokenType = credentialsDict[NativeBridge.tokenTypeKey] as? String, let idToken = credentialsDict[NativeBridge.idTokenKey] as? String else { reject(NativeBridge.credentialsManagerErrorCode, "Incomplete information provided for credentials", NSError.init(domain: NativeBridge.credentialsManagerErrorCode, code: -99999, userInfo: nil)); return; }
        
        let refreshToken = credentialsDict[NativeBridge.refreshTokenKey] as? String
        let scope = credentialsDict[NativeBridge.scopeKey] as? String
        var expiresIn: Date?
         if let string = credentialsDict[NativeBridge.expiresAtKey] as? String, let double = Double(string) {
             expiresIn = Date(timeIntervalSince1970: double)
         } else if let double = credentialsDict[NativeBridge.expiresAtKey] as? Double {
             expiresIn = Date(timeIntervalSince1970: double)
         } else if let dateStr = credentialsDict[NativeBridge.expiresAtKey] as? String {
             let dateFormatter = DateFormatter()
             dateFormatter.dateFormat = NativeBridge.dateFormat
             expiresIn = dateFormatter.date(from: dateStr)
         }
        if let expiresIn = expiresIn {
            let credentials =  Credentials(
                accessToken: accessToken,
                tokenType: tokenType,
                idToken:  idToken,
                refreshToken: refreshToken,
                expiresIn: expiresIn,
                scope: scope,
                recoveryCode: nil
            )
            if (credentialsManager.store(credentials: credentials)) {
                resolve(true)
            } else {
                reject("STORE_FAILED", "Failed to store credentials in the Keychain.", nil)
            }
        } else {
            reject(NativeBridge.credentialsManagerErrorCode, "Incomplete information provided for credentials - 'expiresIn' not found", NSError.init(domain: NativeBridge.credentialsManagerErrorCode, code: -99999, userInfo: nil));
        }
    }
    
    @objc public func getCredentials(scope: String?, minTTL: Int, parameters: [String: Any], forceRefresh: Bool, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        if(forceRefresh) {
            credentialsManager.renew(parameters: parameters) { result in
                switch result {
                case .success(let credentials):
                    resolve(credentials.asDictionary())
                case .failure(let error):
                    reject(error.reactNativeErrorCode(), error.errorDescription, error)
                }
            }
        } else {
            credentialsManager.credentials(withScope: scope, minTTL: minTTL, parameters: parameters) { result in
                switch result {
                case .success(let credentials):
                    resolve(credentials.asDictionary())
                case .failure(let error):
                    reject(error.reactNativeErrorCode(), error.errorDescription, error)
                }
            }
        }
    }
    
    @objc public func hasValidCredentials(minTTL: Int, resolve: RCTPromiseResolveBlock) {
        resolve(credentialsManager.canRenew() || credentialsManager.hasValid(minTTL: minTTL))
    }
    
    @objc public func clearCredentials(resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        let removed = credentialsManager.clear()
        
        // Also clear DPoP key if DPoP is enabled
        if self.useDPoP {
            do {
                try DPoP.clearKeypair()
            } catch {
                // Log error but don't fail the operation
                print("Warning: Failed to clear DPoP key: \(error.localizedDescription)")
            }
        }
        
        resolve(removed)
    }
    
    @objc public func getSSOCredentials(parameters: [String: Any], headers: [String: Any], resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        let stringHeaders = headers.compactMapValues { $0 as? String }
        credentialsManager.ssoCredentials(parameters: parameters, headers: stringHeaders) { result in
            switch result {
            case .success(let ssoCredentials):
                var response: [String: Any] = [
                    "sessionTransferToken": ssoCredentials.sessionTransferToken,
                    "tokenType": ssoCredentials.issuedTokenType,
                    "expiresIn": ssoCredentials.expiresIn,
                    "idToken": ssoCredentials.idToken
                ]
                
                // Add optional fields if present
                if let refreshToken = ssoCredentials.refreshToken {
                    response["refreshToken"] = refreshToken
                }
                
                resolve(response)
            case .failure(let error):
                reject(
                    NativeBridge.credentialsManagerErrorCode,
                    error.localizedDescription,
                    error
                )
            }
        }
    }
    
    @objc public func getDPoPHeaders(url: String, method: String, accessToken: String, tokenType: String, nonce: String?, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        // Validate parameters
        guard !url.isEmpty else {
            reject(
                NativeBridge.dpopMissingParameterCode,
                "URL parameter is required for DPoP header generation",
                nil
            )
            return
        }
        
        guard !method.isEmpty else {
            reject(
                NativeBridge.dpopMissingParameterCode,
                "HTTP method parameter is required for DPoP header generation",
                nil
            )
            return
        }
        
        guard !accessToken.isEmpty else {
            reject(
                NativeBridge.dpopMissingParameterCode,
                "Access token parameter is required for DPoP header generation",
                nil
            )
            return
        }
        
        // Check if token type is DPoP
        guard tokenType.uppercased() == "DPOP" else {
            // If not DPoP, return Bearer token format
            let headers = [
                "Authorization": "Bearer \(accessToken)"
            ]
            resolve(headers)
            return
        }
        
        // Validate URL format
        guard !url.isEmpty, let urlObj = URL(string: url) else {
            reject(
                NativeBridge.dpopMissingParameterCode,
                "Invalid URL format: \(url)",
                nil
            )
            return
        }
        
        var request = URLRequest(url: urlObj)
        request.httpMethod = method
        
        do {
            if let nonce = nonce, !nonce.isEmpty {
                try DPoP.addHeaders(to: &request, accessToken: accessToken, tokenType: tokenType, nonce: nonce)
            } else {
                try DPoP.addHeaders(to: &request, accessToken: accessToken, tokenType: tokenType)
            }
            resolve(request.allHTTPHeaderFields ?? [:])
        } catch {
            if let dpopError = error as? DPoPError {
                reject(dpopError.reactNativeErrorCode(), dpopError.errorDescription, error)
            } else {
                reject(NativeBridge.dpopGenerationFailedCode, error.localizedDescription, error)
            }
        }
    }
    
    @objc public func clearDPoPKey(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        do {
            try DPoP.clearKeypair()
            resolve(nil)
        } catch {
            if let dpopError = error as? DPoPError {
                reject(dpopError.reactNativeErrorCode(), dpopError.errorDescription, error)
            } else {
                reject(NativeBridge.dpopClearKeyFailedCode, error.localizedDescription, error)
            }
        }
    }
    
    @objc public func getApiCredentials(audience: String, scope: String?, minTTL: Int, parameters: [String: Any], resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        credentialsManager.apiCredentials(forAudience: audience, scope: scope, minTTL: minTTL, parameters: parameters) { result in
            switch result {
            case .success(let credentials):
                resolve(credentials.asDictionary())
            case .failure(let error):
                reject(error.reactNativeErrorCode(), error.errorDescription, error)
            }
        }
    }

    
    @objc public func clearApiCredentials(audience: String, scope: String?, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        // The clear(forAudience:scope:) method returns a boolean indicating success.
        // We can resolve the promise with this boolean value.
        resolve(credentialsManager.clear(forAudience: audience, scope: scope))
    }
    
    @objc public func customTokenExchange(subjectToken: String, subjectTokenType: String, audience: String?, scope: String?, organization: String?, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        var auth = Auth0.authentication(clientId: self.clientId, domain: self.domain)
        if self.useDPoP {
            auth = auth.useDPoP()
        }
        
        let finalScope = scope ?? "openid profile email"
        
        auth.customTokenExchange(
            subjectToken: subjectToken,
            subjectTokenType: subjectTokenType,
            audience: audience,
            scope: finalScope,
            organization: organization
        ).start { result in
            switch result {
            case .success(let credentials):
                resolve(credentials.asDictionary())
            case .failure(let error):
                reject(error.code, error.localizedDescription, error)
            }
        }
    }
    
    // MARK: - MFA Flexible Factors Grant

    @objc public func getMfaAuthenticators(mfaToken: String, factorsAllowed: [String]?, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        mfaClient.getAuthenticators(mfaToken: mfaToken, factorsAllowed: factorsAllowed, resolve: resolve, reject: reject)
    }

    @objc public func mfaEnroll(mfaToken: String, type: String, value: String?, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        mfaClient.enroll(mfaToken: mfaToken, type: type, value: value, resolve: resolve, reject: reject)
    }

    @objc public func mfaChallenge(mfaToken: String, authenticatorId: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        mfaClient.challenge(mfaToken: mfaToken, authenticatorId: authenticatorId, resolve: resolve, reject: reject)
    }

    @objc public func mfaVerify(mfaToken: String, type: String, code: String, bindingCode: String?, scope: String?, audience: String?, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        mfaClient.verify(mfaToken: mfaToken, type: type, code: code, bindingCode: bindingCode, scope: scope, audience: audience, resolve: resolve, reject: reject)
    }

    // MARK: - Passkey Methods (challenge / exchange)

    @objc public func passkeySignupChallenge(email: String?, phoneNumber: String?, username: String?, name: String?, givenName: String?, familyName: String?, nickname: String?, picture: String?, userMetadata: [String: String]?, realm: String?, organization: String?, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        guard #available(iOS 16.6, *) else {
            reject("PASSKEY_NOT_AVAILABLE", "Passkeys require iOS 16.6 or later", nil)
            return
        }

        let trimmedEmail = email?.trimmingCharacters(in: .whitespacesAndNewlines)
        let finalEmail = (trimmedEmail?.isEmpty == true) ? nil : trimmedEmail
        let phoneValue = phoneNumber?.isEmpty == true ? nil : phoneNumber
        let usernameValue = username?.isEmpty == true ? nil : username
        let nameValue = name?.isEmpty == true ? nil : name
        let givenNameValue = givenName?.isEmpty == true ? nil : givenName
        let familyNameValue = familyName?.isEmpty == true ? nil : familyName
        let nicknameValue = nickname?.isEmpty == true ? nil : nickname
        let pictureValue = picture?.isEmpty == true ? nil : picture
        let userMetadataValue = userMetadata?.isEmpty == true ? nil : userMetadata
        let realmValue = realm?.isEmpty == true ? nil : realm
        let orgValue = organization?.isEmpty == true ? nil : organization

        var auth = Auth0.authentication(clientId: self.clientId, domain: self.domain)
        if self.useDPoP {
            auth = auth.useDPoP()
        }

        auth.passkeySignupChallenge(
            email: finalEmail,
            phoneNumber: phoneValue,
            username: usernameValue,
            name: nameValue,
            givenName: givenNameValue,
            familyName: familyNameValue,
            nickname: nicknameValue,
            picture: pictureValue,
            userMetadata: userMetadataValue,
            connection: realmValue,
            organization: orgValue
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
                    "authSession": challenge.authenticationSession,
                    "authParamsPublicKey": authParamsPublicKey
                ]
                resolve(response)
            case .failure(let error):
                reject("PASSKEY_CHALLENGE_FAILED", error.localizedDescription, error)
            }
        }
    }

    @objc public func passkeyLoginChallenge(realm: String?, organization: String?, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        guard #available(iOS 16.6, *) else {
            reject("PASSKEY_NOT_AVAILABLE", "Passkeys require iOS 16.6 or later", nil)
            return
        }

        let realmValue = realm?.isEmpty == true ? nil : realm
        let orgValue = organization?.isEmpty == true ? nil : organization

        var auth = Auth0.authentication(clientId: self.clientId, domain: self.domain)
        if self.useDPoP {
            auth = auth.useDPoP()
        }

        auth.passkeyLoginChallenge(
            connection: realmValue,
            organization: orgValue
        ).start { result in
            switch result {
            case .success(let challenge):
                let authParamsPublicKey: [String: Any] = [
                    "rpId": challenge.relyingPartyId,
                    "challenge": challenge.challengeData.base64URLEncodedString()
                ]
                let response: [String: Any] = [
                    "authSession": challenge.authenticationSession,
                    "authParamsPublicKey": authParamsPublicKey
                ]
                resolve(response)
            case .failure(let error):
                reject("PASSKEY_CHALLENGE_FAILED", error.localizedDescription, error)
            }
        }
    }

    @objc public func getTokenByPasskey(authSession: String, authResponse: String, realm: String?, audience: String?, scope: String?, organization: String?, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        guard #available(iOS 16.6, *) else {
            reject("PASSKEY_EXCHANGE_FAILED", "Passkeys require iOS 16.6 or later", nil)
            return
        }

        let realmValue = realm?.isEmpty == true ? nil : realm
        let audienceValue = audience?.isEmpty == true ? nil : audience
        let orgValue = organization?.isEmpty == true ? nil : organization
        let finalScope = scope?.isEmpty == true ? "openid profile email" : (scope ?? "openid profile email")

        guard let responseData = authResponse.data(using: .utf8),
              let json = try? JSONSerialization.jsonObject(with: responseData) as? [String: Any],
              let responseDict = json["response"] as? [String: Any],
              let idString = json["id"] as? String,
              let credentialID = Data(base64URLEncoded: idString),
              let clientDataJSONString = responseDict["clientDataJSON"] as? String,
              let clientDataJSON = Data(base64URLEncoded: clientDataJSONString) else {
            reject("PASSKEY_EXCHANGE_FAILED", "Invalid authResponse JSON", nil)
            return
        }

        let attachmentString = json["authenticatorAttachment"] as? String ?? "platform"
        let attachment: ASAuthorizationPublicKeyCredentialAttachment = attachmentString == "cross-platform" ? .crossPlatform : .platform

        var auth = Auth0.authentication(clientId: self.clientId, domain: self.domain)
        if self.useDPoP {
            auth = auth.useDPoP()
        }

        if let attestationObjectString = responseDict["attestationObject"] as? String {
            let attestationObject = Data(base64URLEncoded: attestationObjectString)
            let passkey = BridgeSignupPasskey(
                credentialID: credentialID,
                attachment: attachment,
                rawClientDataJSON: clientDataJSON,
                rawAttestationObject: attestationObject
            )
            let challenge = PasskeySignupChallenge(
                authenticationSession: authSession,
                relyingPartyId: self.domain,
                userId: Data(),
                userName: "",
                challengeData: Data()
            )
            auth.login(
                passkey: passkey,
                challenge: challenge,
                connection: realmValue,
                audience: audienceValue,
                scope: finalScope,
                organization: orgValue
            ).start { result in
                switch result {
                case .success(let credentials):
                    resolve(credentials.asDictionary())
                case .failure(let error):
                    reject("PASSKEY_EXCHANGE_FAILED", error.localizedDescription, error)
                }
            }
        } else {
            guard let authenticatorDataString = responseDict["authenticatorData"] as? String,
                  let authenticatorData = Data(base64URLEncoded: authenticatorDataString),
                  let signatureString = responseDict["signature"] as? String,
                  let signature = Data(base64URLEncoded: signatureString) else {
                reject("PASSKEY_EXCHANGE_FAILED", "Missing authenticatorData or signature in authResponse", nil)
                return
            }
            let userHandleString = responseDict["userHandle"] as? String
            let userHandle = userHandleString.flatMap { Data(base64URLEncoded: $0) }

            let passkey = BridgeLoginPasskey(
                userID: userHandle,
                credentialID: credentialID,
                attachment: attachment,
                rawClientDataJSON: clientDataJSON,
                rawAuthenticatorData: authenticatorData,
                signature: signature
            )
            let challenge = PasskeyLoginChallenge(
                authenticationSession: authSession,
                relyingPartyId: self.domain,
                challengeData: Data()
            )
            auth.login(
                passkey: passkey,
                challenge: challenge,
                connection: realmValue,
                audience: audienceValue,
                scope: finalScope,
                organization: orgValue
            ).start { result in
                switch result {
                case .success(let credentials):
                    resolve(credentials.asDictionary())
                case .failure(let error):
                    reject("PASSKEY_EXCHANGE_FAILED", error.localizedDescription, error)
                }
            }
        }
    }

    @objc public func getClientId() -> String {
        return clientId
    }

    @objc public func getDomain() -> String {
        return domain
    }

    func convert(policyInt: Int) -> LAPolicy {
        if (policyInt == 2) {
            return LAPolicy.deviceOwnerAuthentication
        }
        return LAPolicy.deviceOwnerAuthenticationWithBiometrics
    }

    func convert(policyString: String, timeout: Int) -> BiometricPolicy {
        switch policyString {
        case "default":
            return .default
        case "always":
            return .always
        case "session":
            return .session(timeoutInSeconds: timeout)
        case "appLifecycle":
            return .appLifecycle(timeoutInSeconds: timeout)
        default:
            return .default
        }
    }

}


extension Credentials {
    func asDictionary() -> [String: Any] {
        return [
            NativeBridge.accessTokenKey: self.accessToken,
            NativeBridge.tokenTypeKey: self.tokenType,
            NativeBridge.idTokenKey: self.idToken,
            NativeBridge.refreshTokenKey: self.refreshToken as Any,
            NativeBridge.expiresAtKey: floor(self.expiresIn.timeIntervalSince1970),
            NativeBridge.scopeKey: self.scope as Any
        ]
    }
}

extension APICredentials {
    func asDictionary() -> [String: Any] {
        return [
            NativeBridge.accessTokenKey: self.accessToken,
            NativeBridge.tokenTypeKey: self.tokenType,
            NativeBridge.expiresAtKey: floor(self.expiresIn.timeIntervalSince1970),
            NativeBridge.scopeKey: self.scope
        ]
    }
}

extension WebAuthError {
    func reactNativeErrorCode() -> String {
        var code: String
        switch self {
            case WebAuthError.noBundleIdentifier: code = "NO_BUNDLE_IDENTIFIER"
            case WebAuthError.transactionActiveAlready: code = "TRANSACTION_ACTIVE_ALREADY"
            case WebAuthError.invalidInvitationURL: code = "INVALID_INVITATION_URL"
            case WebAuthError.userCancelled: code = "USER_CANCELLED"
            case WebAuthError.noAuthorizationCode: code = "NO_AUTHORIZATION_CODE"
            case WebAuthError.pkceNotAllowed: code = "PKCE_NOT_ALLOWED"
            case WebAuthError.idTokenValidationFailed: code = "ID_TOKEN_VALIDATION_FAILED"
            case WebAuthError.other: if let cause = self.cause as? AuthenticationError {
                code = cause.code
            } else {
                code = "OTHER"
            }
            default: code = "UNKNOWN"
        }
        return code
    }
}

extension DPoPError {
    func reactNativeErrorCode() -> String {
        var code: String
        switch self {
            case DPoPError.secureEnclaveOperationFailed: code = NativeBridge.dpopKeyGenerationFailedCode
            case DPoPError.keychainOperationFailed: code = NativeBridge.dpopKeyStorageFailedCode
            case DPoPError.cryptoKitOperationFailed: code = NativeBridge.dpopProofFailedCode
            case DPoPError.secKeyOperationFailed: code = NativeBridge.dpopProofFailedCode
            case DPoPError.other: code = NativeBridge.dpopErrorCode
            case DPoPError.unknown: code = NativeBridge.dpopErrorCode
        default:
            code = NativeBridge.dpopErrorCode
        }
        return code
    }
}

extension CredentialsManagerError {
    func reactNativeErrorCode() -> String {
        var code: String
        switch self {
            case CredentialsManagerError.noCredentials: code = "NO_CREDENTIALS"
            case CredentialsManagerError.noRefreshToken: code = "NO_REFRESH_TOKEN"
            case CredentialsManagerError.renewFailed: if let cause = self.cause as? AuthenticationError {
                code = cause.code
            } else {
                code = "RENEW_FAILED"
            }
            case CredentialsManagerError.storeFailed: code = "STORE_FAILED"
            case CredentialsManagerError.biometricsFailed: code = "BIOMETRICS_FAILED"
            case CredentialsManagerError.revokeFailed: if let cause = self.cause as? AuthenticationError {
                code = cause.code
            } else {
                code = "REVOKE_FAILED"
            }
            case CredentialsManagerError.largeMinTTL: code = "LARGE_MIN_TTL"
            case CredentialsManagerError.dpopKeyMissing: code = "DPOP_KEY_MISSING"
            case CredentialsManagerError.dpopKeyMismatch: code = "DPOP_KEY_MISMATCH"
            case CredentialsManagerError.dpopNotConfigured: code = "DPOP_NOT_CONFIGURED"
            default: code = "UNKNOWN"
        }
        return code
    }
}



// MARK: - Data Base64URL Extensions

extension Data {
    init?(base64URLEncoded string: String) {
        var base64 = string
            .replacingOccurrences(of: "-", with: "+")
            .replacingOccurrences(of: "_", with: "/")
        let remainder = base64.count % 4
        if remainder > 0 {
            base64.append(String(repeating: "=", count: 4 - remainder))
        }
        self.init(base64Encoded: base64)
    }

    func base64URLEncodedString() -> String {
        return self.base64EncodedString()
            .replacingOccurrences(of: "+", with: "-")
            .replacingOccurrences(of: "/", with: "_")
            .replacingOccurrences(of: "=", with: "")
    }
}

// MARK: - Passkey Bridge Types

@available(iOS 16.6, macOS 13.5, *)
struct BridgeLoginPasskey: LoginPasskey {
    var userID: Data!
    var credentialID: Data
    var attachment: ASAuthorizationPublicKeyCredentialAttachment
    var rawClientDataJSON: Data
    var rawAuthenticatorData: Data!
    var signature: Data!
}

@available(iOS 16.6, macOS 13.5, *)
struct BridgeSignupPasskey: SignupPasskey {
    var credentialID: Data
    var attachment: ASAuthorizationPublicKeyCredentialAttachment
    var rawClientDataJSON: Data
    var rawAttestationObject: Data?
}
