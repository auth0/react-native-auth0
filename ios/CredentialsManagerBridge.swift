//
//  CredentialsManagerBridge.swift
//  A0Auth0
//
//  Created by Poovamraj Thanganadar Thiagarajan on 09.08.22.
//

import Auth0

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
    
    @objc public init(clientId: NSString, domain: NSString) {
        let auth0 = Auth0
            .authentication(clientId: clientId as String, domain: domain as String)
        self.credentialsManager = CredentialsManager(authentication: auth0)
        super.init()
   }
    
    @objc public func saveCredentials(credentialsMap: NSDictionary, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        let credentials = Credentials.fromNSDictionary(credentialsMap: credentialsMap)
        resolve(credentialsManager.store(credentials: credentials))
    }
    
    @objc public func getCredentials(scope: NSString?, minTTL: NSInteger, parameters: NSDictionary?, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        credentialsManager.credentials(withScope: scope as String?, minTTL: minTTL, parameters: parameters as! [String : Any]) { result in
            switch result {
            case .success(let credentials):
                resolve(credentials.toNSDictionary())
            case .failure(let error):
                reject(CredentialsManagerBridge.errorCode, error.errorDescription, error)
            }
        }
    }
    
    @objc public func hasValidCredentials(minTTL: Int, resolve: RCTPromiseResolveBlock) {
        resolve(credentialsManager.hasValid(minTTL: minTTL))
    }
    
    @objc public func clearCredentials(resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        resolve(credentialsManager.clear())
    }
    
    @objc public func enableLocalAuthentication(title: NSString?, cancelTitle: NSString?, fallbackTitle: NSString?) {
        let titleValue: NSString = title ?? "Please authenticate to continue"
        self.credentialsManager.enableBiometrics(withTitle: titleValue as String, cancelTitle: cancelTitle as String?, fallbackTitle: fallbackTitle as String?)
    }
}


extension Credentials {
    static func fromNSDictionary(credentialsMap: NSDictionary) -> Credentials {
        let accessToken = credentialsMap[CredentialsManagerBridge.accessTokenKey]
        let idToken = credentialsMap[CredentialsManagerBridge.idTokenKey]
        let tokenType = credentialsMap[CredentialsManagerBridge.tokenTypeKey]
        let refreshToken = credentialsMap[CredentialsManagerBridge.refreshTokenKey] as? String
        let scope = credentialsMap[CredentialsManagerBridge.scopeKey] as? String
        
        var expiresIn: Date?
        if let string = credentialsMap[CredentialsManagerBridge.expiresInKey] as? String, let double = Double(string) {
            expiresIn = Date(timeIntervalSinceNow: double)
        } else if let double = credentialsMap[CredentialsManagerBridge.expiresInKey] as? Double {
            expiresIn = Date(timeIntervalSinceNow: double)
        } else if let dateStr = credentialsMap[CredentialsManagerBridge.expiresInKey] as? String {
            let dateFormatter = DateFormatter()
            dateFormatter.dateFormat = CredentialsManagerBridge.dateFormat
            expiresIn = dateFormatter.date(from: dateStr)
        }
        
        return Credentials(
            accessToken: accessToken as! String,
            tokenType: tokenType as! String,
            idToken: idToken as! String,
            refreshToken: refreshToken,
            expiresIn: expiresIn ?? Date(),
            scope: scope,
            recoveryCode: nil
        )
    }
    
    func toNSDictionary() -> NSDictionary {
        return NSDictionary(dictionary: [
            CredentialsManagerBridge.accessTokenKey: self.accessToken,
            CredentialsManagerBridge.tokenTypeKey: self.tokenType,
            CredentialsManagerBridge.idTokenKey: self.idToken,
            CredentialsManagerBridge.refreshTokenKey: self.refreshToken!,
            CredentialsManagerBridge.expiresInKey: self.expiresIn,
            CredentialsManagerBridge.scopeKey: self.scope!
        ])
    }
}
