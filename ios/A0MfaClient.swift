//
//  A0MfaClient.swift
//  A0Auth0
//
//  Copyright © 2025 Facebook. All rights reserved.
//

import Auth0
import Foundation

/// A dedicated bridge class for MFA (Multi-Factor Authentication) operations.
/// Encapsulates all MFA-related native SDK interactions, keeping them separate
/// from the main NativeBridge for better organization and maintainability.
enum MfaFactorType: String {
    case phone
    case email
    case otp
    case push
    case voice
}

enum MfaVerificationType: String {
    case otp
    case oob
    case recoveryCode
}

class A0MfaClient {

    private let clientId: String
    private let domain: String
    private let useDPoP: Bool

    private lazy var mfaClient: MFAClient = {
        var client = Auth0.mfa(clientId: clientId, domain: domain)
        if useDPoP {
            client = client.useDPoP()
        }
        return client
    }()

    init(clientId: String, domain: String, useDPoP: Bool) {
        self.clientId = clientId
        self.domain = domain
        self.useDPoP = useDPoP
    }

    // Maps the public MfaFactorType vocabulary (otp/sms/voice/email/push) onto
    // the challenge-type tokens Auth0.swift filters `authenticator.type` against.
    // Note: iOS cannot distinguish sms from voice — both are the `phone` type.
    private func mapFactorType(_ factor: String) -> [String] {
        switch factor.lowercased() {
        case "otp": return ["otp", "totp"]
        case "sms", "voice": return ["phone"]
        case "email": return ["email"]
        case "push": return ["push-notification"]
        default: return []
        }
    }

    func getAuthenticators(mfaToken: String, factorsAllowed: [String]?, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        let requested = (factorsAllowed ?? []).map { $0.lowercased() }
        var allowedFactors = requested.flatMap { mapFactorType($0) }

        // Auth0.swift rejects an empty factorsAllowed list, so default to every
        // recognized challenge-type token to match Android/web "return all" behaviour.
        if allowedFactors.isEmpty {
            allowedFactors = ["otp", "totp", "phone", "email", "push-notification", "recovery-code"]
        }

        // Auth0.swift filters only on `authenticator.type`, where sms and voice
        // both surface as "phone" — so an sms-only (or voice-only) request still
        // returns the other channel. Narrow phone-type results by oobChannel when
        // the caller asked for one but not both. Empty set = no narrowing (covers
        // the return-all default and requests that don't mention sms/voice).
        var wantedPhoneChannels = Set<String>()
        if requested.contains("sms") { wantedPhoneChannels.insert("sms") }
        if requested.contains("voice") { wantedPhoneChannels.insert("voice") }
        let narrowPhoneChannels = wantedPhoneChannels.count == 1

        mfaClient.getAuthenticators(mfaToken: mfaToken, factorsAllowed: allowedFactors).start { result in
            switch result {
            case .success(let authenticators):
                let list = authenticators.compactMap { authenticator -> [String: Any]? in
                    if narrowPhoneChannels, authenticator.type == "phone",
                       let channel = authenticator.oobChannel,
                       !wantedPhoneChannels.contains(channel) {
                        return nil
                    }
                    var dict: [String: Any] = [
                        "id": authenticator.id,
                        "type": authenticator.type,
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
        guard let factorType = MfaFactorType(rawValue: type) else {
            reject("MFA_ENROLLMENT_ERROR", "Unsupported enrollment type: \(type)", nil)
            return
        }

        switch factorType {
        case .phone, .voice:
            guard let phoneNumber = value else {
                reject("MFA_ENROLLMENT_ERROR", "Phone number is required for phone enrollment", nil)
                return
            }
            mfaClient.enroll(mfaToken: mfaToken, phoneNumber: phoneNumber).start { result in
                switch result {
                case .success(let challenge):
                    var dict: [String: Any] = ["type": "oob"]
                    dict["oobCode"] = challenge.oobCode
                    dict["bindingMethod"] = challenge.bindingMethod
                    if let recoveryCodes = challenge.recoveryCodes { dict["recoveryCodes"] = recoveryCodes }
                    resolve(dict)
                case .failure(let error):
                    reject(error.code, error.localizedDescription, error)
                }
            }
        case .email:
            guard let email = value else {
                reject("MFA_ENROLLMENT_ERROR", "Email is required for email enrollment", nil)
                return
            }
            mfaClient.enroll(mfaToken: mfaToken, email: email).start { result in
                switch result {
                case .success(let challenge):
                    var dict: [String: Any] = ["type": "oob"]
                    dict["oobCode"] = challenge.oobCode
                    dict["bindingMethod"] = challenge.bindingMethod
                    if let recoveryCodes = challenge.recoveryCodes { dict["recoveryCodes"] = recoveryCodes }
                    resolve(dict)
                case .failure(let error):
                    reject(error.code, error.localizedDescription, error)
                }
            }
        case .otp:
            let request: Request<OTPMFAEnrollmentChallenge, MfaEnrollmentError> = mfaClient.enroll(mfaToken: mfaToken)
            request.start { result in
                switch result {
                case .success(let challenge):
                    var dict: [String: Any] = ["type": "totp"]
                    dict["barcodeUri"] = challenge.barcodeUri
                    dict["secret"] = challenge.secret
                    if let recoveryCodes = challenge.recoveryCodes { dict["recoveryCodes"] = recoveryCodes }
                    resolve(dict)
                case .failure(let error):
                    reject(error.code, error.localizedDescription, error)
                }
            }
        case .push:
            let request: Request<PushMFAEnrollmentChallenge, MfaEnrollmentError> = mfaClient.enroll(mfaToken: mfaToken)
            request.start { result in
                switch result {
                case .success(let challenge):
                    var dict: [String: Any] = ["type": "push"]
                    dict["barcodeUri"] = challenge.barcodeUri
                    dict["oobCode"] = challenge.oobCode
                    dict["oobChannel"] = challenge.oobChannel
                    if let recoveryCodes = challenge.recoveryCodes { dict["recoveryCodes"] = recoveryCodes }
                    resolve(dict)
                case .failure(let error):
                    reject(error.code, error.localizedDescription, error)
                }
            }
        }
    }

    func challenge(mfaToken: String, authenticatorId: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        mfaClient.challenge(with: authenticatorId, mfaToken: mfaToken).start { result in
            switch result {
            case .success(let challenge):
                var dict: [String: Any] = [
                    "challengeType": challenge.challengeType
                ]
                dict["oobCode"] = challenge.oobCode
                if let bindingMethod = challenge.bindingMethod { dict["bindingMethod"] = bindingMethod }
                resolve(dict)
            case .failure(let error):
                reject(error.code, error.localizedDescription, error)
            }
        }
    }

    func verify(mfaToken: String, type: String, code: String, bindingCode: String?, scope: String?, audience: String?, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        guard let verificationType = MfaVerificationType(rawValue: type) else {
            reject("MFA_VERIFY_ERROR", "Unsupported verification type: \(type)", nil)
            return
        }

        let request: Request<Credentials, MFAVerifyError>
        switch verificationType {
        case .otp:
            request = mfaClient.verify(otp: code, mfaToken: mfaToken)
        case .oob:
            request = mfaClient.verify(oobCode: code, bindingCode: bindingCode, mfaToken: mfaToken)
        case .recoveryCode:
            request = mfaClient.verify(recoveryCode: code, mfaToken: mfaToken)
        }

        var extraParameters: [String: Any] = [:]
        if let scope = scope { extraParameters["scope"] = scope }
        if let audience = audience { extraParameters["audience"] = audience }
        let finalRequest = extraParameters.isEmpty ? request : request.parameters(extraParameters)

        finalRequest.start { result in
            switch result {
            case .success(let credentials):
                resolve(credentials.asDictionary())
            case .failure(let error):
                reject(error.code, error.localizedDescription, error)
            }
        }
    }
}
