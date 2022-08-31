//
//  CredentialsManagerBridge.swift
//  A0Auth0
//
//  Created by Poovamraj Thanganadar Thiagarajan on 09.08.22.
//

import Auth0
import Foundation

@objc
public class CredentialsManagerBridge: NSObject {
    
    
    static let accessTokenKey = "accessToken";
    static let idTokenKey = "idToken";
    static let expiresAtKey = "expiresAt";
    static let scopeKey = "scope";
    static let refreshTokenKey = "refreshToken";
    static let typeKey = "type";
    static let tokenTypeKey = "tokenType";
    static let expiresInKey = "expiresIn";
    static let dateFormat = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'";
    
    static let errorCode = "a0.invalid_state.credential_manager_exception"
    
    var credentialsManager: CredentialsManager
    
    @objc public init(clientId: String, domain: String) {
        let auth0 = Auth0
            .authentication(clientId: clientId, domain: domain)
        self.credentialsManager = CredentialsManager(authentication: auth0)
        super.init()
   }
    
    @objc public func saveCredentials(credentialsDict: [String: Any], resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        
        guard let accessToken = credentialsDict[CredentialsManagerBridge.accessTokenKey] as? String, let tokenType = credentialsDict[CredentialsManagerBridge.tokenTypeKey] as? String, let idToken = credentialsDict[CredentialsManagerBridge.idTokenKey] as? String else { reject(CredentialsManagerBridge.errorCode, "Incomplete information provided for credentials", NSError.init(domain: CredentialsManagerBridge.errorCode, code: -99999, userInfo: nil)); return; }
        
        let refreshToken = credentialsDict[CredentialsManagerBridge.refreshTokenKey] as? String
        let scope = credentialsDict[CredentialsManagerBridge.scopeKey] as? String
        var expiresIn: Date?
         if let string = credentialsDict[CredentialsManagerBridge.expiresInKey] as? String, let double = Double(string) {
             expiresIn = Date(timeIntervalSinceNow: double)
         } else if let double = credentialsDict[CredentialsManagerBridge.expiresInKey] as? Double {
             expiresIn = Date(timeIntervalSinceNow: double)
         } else if let dateStr = credentialsDict[CredentialsManagerBridge.expiresInKey] as? String {
             let dateFormatter = DateFormatter()
             dateFormatter.dateFormat = CredentialsManagerBridge.dateFormat
             expiresIn = dateFormatter.date(from: dateStr)
         }
     
        
        let credentials =  Credentials(
            accessToken: accessToken,
            tokenType: tokenType,
            idToken:  idToken,
            refreshToken: refreshToken,
            expiresIn: expiresIn ?? Date(),
            scope: scope,
            recoveryCode: nil
        )
        resolve(credentialsManager.store(credentials: credentials))
    }
    
    @objc public func getCredentials(scope: String?, minTTL: Int, parameters: [String: Any], resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        credentialsManager.credentials(withScope: scope, minTTL: minTTL, parameters: parameters) { result in
            switch result {
            case .success(let credentials):
                resolve(credentials.asDictionary())
            case .failure(let error):
                reject(CredentialsManagerBridge.errorCode, error.errorDescription, error)
            }
        }
    }
    
    @objc public func hasValidCredentials(minTTL: Int, resolve: RCTPromiseResolveBlock) {
        resolve(credentialsManager.canRenew() || credentialsManager.hasValid(minTTL: minTTL))
    }
    
    @objc public func clearCredentials(resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        resolve(credentialsManager.clear())
    }
    
    @objc public func enableLocalAuthentication(title: String?, cancelTitle: String?, fallbackTitle: String?) {
        let titleValue = title ?? "Please authenticate to continue"
        self.credentialsManager.enableBiometrics(withTitle: titleValue, cancelTitle: cancelTitle, fallbackTitle: fallbackTitle)
    }
}


extension Credentials {
    func asDictionary() -> [String: Any] {
        return [
            CredentialsManagerBridge.accessTokenKey: self.accessToken,
            CredentialsManagerBridge.tokenTypeKey: self.tokenType,
            CredentialsManagerBridge.idTokenKey: self.idToken,
            CredentialsManagerBridge.refreshTokenKey: self.refreshToken as Any,
            CredentialsManagerBridge.expiresInKey: self.expiresIn,
            CredentialsManagerBridge.scopeKey: self.scope as Any
        ]
    }
}
