//
//  NativeBridge.swift
//  A0Auth0
//
//  Created by Poovamraj T T on 15/06/23.
//  Copyright © 2023 Facebook. All rights reserved.
//

import Auth0
import Foundation
import LocalAuthentication

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
    
    static let credentialsManagerErrorCode = "a0.invalid_state.credential_manager_exception"
    
    var credentialsManager: CredentialsManager
    var clientId: String
    var domain: String
    
    @objc public init(clientId: String, domain: String) {
        let auth0 = Auth0
            .authentication(clientId: clientId, domain: domain)
        self.clientId = clientId
        self.domain = domain
        self.credentialsManager = CredentialsManager(authentication: auth0)
        super.init()
   }
    
    @objc public func webAuth(state: String?, redirectUri: String, nonce: String?, audience: String?, scope: String?, connection: String?, maxAge: Int, organization: String?, invitationUrl: String?, leeway: Int, ephemeralSession: Bool, safariViewControllerPresentationStyle: Int, additionalParameters: [String: String], resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        let builder = Auth0.webAuth(clientId: self.clientId, domain: self.domain)
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

    @objc public func webAuthLogout(federated: Bool, redirectUri: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        let builder = Auth0.webAuth(clientId: self.clientId, domain: self.domain)
        if let value = URL(string: redirectUri) {
            let _ = builder.redirectURL(value)
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
            resolve(credentialsManager.store(credentials: credentials))
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
        resolve(credentialsManager.clear())
    }
    
    @objc public func enableLocalAuthentication(title: String?, cancelTitle: String?, fallbackTitle: String?, evaluationPolicy: Int) {
        let titleValue = title ?? "Please authenticate to continue"
        let policyValue = self.convert(policyInt: evaluationPolicy)
        self.credentialsManager.enableBiometrics(withTitle: titleValue, cancelTitle: cancelTitle, fallbackTitle: fallbackTitle, evaluationPolicy: policyValue)
    }

    func convert(policyInt: Int) -> LAPolicy {
        if (policyInt == 2) {
            return LAPolicy.deviceOwnerAuthentication
        }
        return LAPolicy.deviceOwnerAuthenticationWithBiometrics
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

extension WebAuthError {
    func reactNativeErrorCode() -> String {
        var code: String
        switch self {
            case .noBundleIdentifier: code = "NO_BUNDLE_IDENTIFIER"
            case .invalidInvitationURL: code = "INVALID_INVITATION_URL"
            case .userCancelled: code = "USER_CANCELLED"
            case .noAuthorizationCode: code = "NO_AUTHORIZATION_CODE"
            case .pkceNotAllowed: code = "PKCE_NOT_ALLOWED"
            case .idTokenValidationFailed: code = "ID_TOKEN_VALIDATION_FAILED"
            case .other: if let cause = self.cause as? AuthenticationError {
                code = cause.code
            } else {
                code = "OTHER"
            }
            default: code = "UNKNOWN"
        }
        return code
    }
}

extension CredentialsManagerError {
    func reactNativeErrorCode() -> String {
        var code: String
        switch self {
            case .noCredentials: code = "NO_CREDENTIALS"
            case .noRefreshToken: code = "NO_REFRESH_TOKEN"
            case .renewFailed: if let cause = self.cause as? AuthenticationError {
                code = cause.code
            } else {
                code = "RENEW_FAILED"
            }
            case .storeFailed: code = "STORE_FAILED"
            case .biometricsFailed: code = "BIOMETRICS_FAILED"
            case .revokeFailed: if let cause = self.cause as? AuthenticationError {
                code = cause.code
            } else {
                code = "REVOKE_FAILED"
            } 
            case .largeMinTTL: code = "LARGE_MIN_TTL"
            default: code = "UNKNOWN"
        }
        return code
    }
}
