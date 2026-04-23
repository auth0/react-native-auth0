//
//  A0MfaBridge.swift
//  A0Auth0
//
//  Copyright © 2025 Facebook. All rights reserved.
//

import Auth0
import Foundation

/// A dedicated bridge class for MFA (Multi-Factor Authentication) operations.
/// Encapsulates all MFA-related native SDK interactions, keeping them separate
/// from the main NativeBridge for better organization and maintainability.
class A0MfaBridge {

    private let clientId: String
    private let domain: String
    private let useDPoP: Bool

    init(clientId: String, domain: String, useDPoP: Bool) {
        self.clientId = clientId
        self.domain = domain
        self.useDPoP = useDPoP
    }

    private func createAuthentication() -> Authentication {
        var auth = Auth0.authentication(clientId: clientId, domain: domain)
        if useDPoP {
            auth = auth.useDPoP()
        }
        return auth
    }

    func getAuthenticators(mfaToken: String, factorsAllowed: [String]?, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        let mfaClient = createAuthentication().mfa(mfaToken: mfaToken)
        let allowedFactors = factorsAllowed ?? []

        mfaClient.getAuthenticators(factorsAllowed: allowedFactors).start { result in
            switch result {
            case .success(let authenticators):
                let list = authenticators.map { authenticator -> [String: Any] in
                    var dict: [String: Any] = [
                        "id": authenticator.id,
                        "authenticatorType": authenticator.authenticatorType,
                        "active": authenticator.active
                    ]
                    if let name = authenticator.name { dict["name"] = name }
                    if let oobChannel = authenticator.oobChannel { dict["oobChannel"] = oobChannel }
                    return dict
                }
                resolve(list)
            case .failure(let error):
                reject(error.code, error.localizedDescription, error)
            }
        }
    }

    func enroll(mfaToken: String, type: String, value: String?, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        let mfaClient = createAuthentication().mfa(mfaToken: mfaToken)

        switch type {
        case "phone":
            guard let phoneNumber = value else {
                reject("MFA_ENROLLMENT_ERROR", "Phone number is required for phone enrollment", nil)
                return
            }
            mfaClient.enroll(mfaToken: mfaToken, phoneNumber: phoneNumber).start { result in
                switch result {
                case .success(let challenge):
                    var dict: [String: Any] = ["type": "oob"]
                    dict["oobCode"] = challenge.oobCode
                    if let bindingMethod = challenge.bindingMethod { dict["bindingMethod"] = bindingMethod }
                    if let recoveryCodes = challenge.recoveryCodes { dict["recoveryCodes"] = recoveryCodes }
                    resolve(dict)
                case .failure(let error):
                    reject(error.code, error.localizedDescription, error)
                }
            }
        case "email":
            guard let email = value else {
                reject("MFA_ENROLLMENT_ERROR", "Email is required for email enrollment", nil)
                return
            }
            mfaClient.enroll(mfaToken: mfaToken, email: email).start { result in
                switch result {
                case .success(let challenge):
                    var dict: [String: Any] = ["type": "oob"]
                    dict["oobCode"] = challenge.oobCode
                    if let bindingMethod = challenge.bindingMethod { dict["bindingMethod"] = bindingMethod }
                    if let recoveryCodes = challenge.recoveryCodes { dict["recoveryCodes"] = recoveryCodes }
                    resolve(dict)
                case .failure(let error):
                    reject(error.code, error.localizedDescription, error)
                }
            }
        case "otp":
            mfaClient.enroll(mfaToken: mfaToken).start { result in
                switch result {
                case .success(let challenge):
                    var dict: [String: Any] = ["type": "totp"]
                    // The native Auth0 SDK exposes this TOTP enrollment URI as `barcode`,
                    // but the React Native / TypeScript interface expects it as `barcodeUri`.
                    dict["barcodeUri"] = challenge.barcode
                    dict["secret"] = challenge.secret
                    if let recoveryCodes = challenge.recoveryCodes { dict["recoveryCodes"] = recoveryCodes }
                    resolve(dict)
                case .failure(let error):
                    reject(error.code, error.localizedDescription, error)
                }
            }
        default:
            reject("MFA_ENROLLMENT_ERROR", "Unsupported enrollment type: \(type)", nil)
        }
    }

    func challenge(mfaToken: String, authenticatorId: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        let mfaClient = createAuthentication().mfa(mfaToken: mfaToken)

        mfaClient.challenge(with: authenticatorId, mfaToken: mfaToken).start { result in
            switch result {
            case .success(let challenge):
                var dict: [String: Any] = [
                    "challengeType": challenge.challengeType
                ]
                if let oobCode = challenge.oobCode { dict["oobCode"] = oobCode }
                if let bindingMethod = challenge.bindingMethod { dict["bindingMethod"] = bindingMethod }
                resolve(dict)
            case .failure(let error):
                reject(error.code, error.localizedDescription, error)
            }
        }
    }

    func verify(mfaToken: String, type: String, code: String, bindingCode: String?, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        let mfaClient = createAuthentication().mfa(mfaToken: mfaToken)

        switch type {
        case "otp":
            mfaClient.verify(otp: code, mfaToken: mfaToken).start { result in
                switch result {
                case .success(let credentials):
                    resolve(credentials.asDictionary())
                case .failure(let error):
                    reject(error.code, error.localizedDescription, error)
                }
            }
        case "oob":
            mfaClient.verify(oobCode: code, bindingCode: bindingCode, mfaToken: mfaToken).start { result in
                switch result {
                case .success(let credentials):
                    resolve(credentials.asDictionary())
                case .failure(let error):
                    reject(error.code, error.localizedDescription, error)
                }
            }
        case "recoveryCode":
            mfaClient.verify(recoveryCode: code, mfaToken: mfaToken).start { result in
                switch result {
                case .success(let credentials):
                    resolve(credentials.asDictionary())
                case .failure(let error):
                    reject(error.code, error.localizedDescription, error)
                }
            }
        default:
            reject("MFA_VERIFY_ERROR", "Unsupported verification type: \(type)", nil)
        }
    }
}
