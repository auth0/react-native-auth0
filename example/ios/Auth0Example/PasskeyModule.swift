import AuthenticationServices
import Foundation

@available(iOS 16.6, *)
@objc(PasskeyModule)
class PasskeyModule: NSObject {

  @objc static func requiresMainQueueSetup() -> Bool {
    return true
  }

  @objc func createPasskey(_ requestJson: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    guard #available(iOS 16.6, *) else {
      reject("PASSKEY_NOT_AVAILABLE", "Passkeys require iOS 16.6 or later", nil)
      return
    }

    guard let data = requestJson.data(using: .utf8),
          let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else {
      reject("PASSKEY_FAILED", "Invalid request JSON", nil)
      return
    }

    guard let rp = json["rp"] as? [String: Any],
          let rpId = rp["id"] as? String,
          let challengeStr = json["challenge"] as? String,
          let challengeData = Data(base64URLEncoded: challengeStr),
          let user = json["user"] as? [String: Any],
          let userName = user["name"] as? String,
          let userIdStr = user["id"] as? String,
          let userId = Data(base64URLEncoded: userIdStr) else {
      reject("PASSKEY_FAILED", "Missing required fields: rp.id, challenge, user.id, user.name", nil)
      return
    }

    let provider = ASAuthorizationPlatformPublicKeyCredentialProvider(relyingPartyIdentifier: rpId)
    let request = provider.createCredentialRegistrationRequest(challenge: challengeData, name: userName, userID: userId)

    let delegate = AuthorizationDelegate { credential in
      guard let registration = credential as? ASAuthorizationPlatformPublicKeyCredentialRegistration else {
        reject("PASSKEY_FAILED", "Unexpected credential type", nil)
        return
      }
      let result: [String: Any] = [
        "id": registration.credentialID.base64URLEncodedString(),
        "rawId": registration.credentialID.base64URLEncodedString(),
        "type": "public-key",
        "response": [
          "clientDataJSON": registration.rawClientDataJSON.base64URLEncodedString(),
          "attestationObject": (registration.rawAttestationObject ?? Data()).base64URLEncodedString()
        ],
        "authenticatorAttachment": "platform"
      ]
      if let jsonData = try? JSONSerialization.data(withJSONObject: result),
         let jsonString = String(data: jsonData, encoding: .utf8) {
        resolve(jsonString)
      } else {
        reject("PASSKEY_FAILED", "Failed to serialize credential response", nil)
      }
    } onError: { error in
      if let authError = error as? ASAuthorizationError, authError.code == .canceled {
        reject("USER_CANCELLED", "User cancelled passkey creation", error)
      } else {
        reject("PASSKEY_FAILED", error.localizedDescription, error)
      }
    }

    let controller = ASAuthorizationController(authorizationRequests: [request])
    controller.delegate = delegate
    controller.presentationContextProvider = delegate
    objc_setAssociatedObject(controller, "delegate", delegate, .OBJC_ASSOCIATION_RETAIN_NONATOMIC)
    controller.performRequests()
  }

  @objc func getPasskey(_ requestJson: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    guard #available(iOS 16.6, *) else {
      reject("PASSKEY_NOT_AVAILABLE", "Passkeys require iOS 16.6 or later", nil)
      return
    }

    guard let data = requestJson.data(using: .utf8),
          let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else {
      reject("PASSKEY_FAILED", "Invalid request JSON", nil)
      return
    }

    guard let challengeStr = json["challenge"] as? String,
          let challengeData = Data(base64URLEncoded: challengeStr) else {
      reject("PASSKEY_FAILED", "Missing required 'challenge' field", nil)
      return
    }

    let rpId = json["rpId"] as? String ?? ""
    let provider = ASAuthorizationPlatformPublicKeyCredentialProvider(relyingPartyIdentifier: rpId)
    let assertionRequest = provider.createCredentialAssertionRequest(challenge: challengeData)

    if let allowCredentials = json["allowCredentials"] as? [[String: Any]] {
      assertionRequest.allowedCredentials = allowCredentials.compactMap { cred in
        guard let idStr = cred["id"] as? String,
              let idData = Data(base64URLEncoded: idStr) else { return nil }
        return ASAuthorizationPlatformPublicKeyCredentialDescriptor(credentialID: idData)
      }
    }

    let delegate = AuthorizationDelegate { credential in
      guard let assertion = credential as? ASAuthorizationPlatformPublicKeyCredentialAssertion else {
        reject("PASSKEY_FAILED", "Unexpected credential type", nil)
        return
      }
      var response: [String: Any] = [
        "clientDataJSON": assertion.rawClientDataJSON.base64URLEncodedString(),
        "authenticatorData": assertion.rawAuthenticatorData.base64URLEncodedString(),
        "signature": assertion.signature.base64URLEncodedString()
      ]
      if let userHandle = assertion.userID {
        response["userHandle"] = userHandle.base64URLEncodedString()
      }
      let result: [String: Any] = [
        "id": assertion.credentialID.base64URLEncodedString(),
        "rawId": assertion.credentialID.base64URLEncodedString(),
        "type": "public-key",
        "response": response,
        "authenticatorAttachment": "platform"
      ]
      if let jsonData = try? JSONSerialization.data(withJSONObject: result),
         let jsonString = String(data: jsonData, encoding: .utf8) {
        resolve(jsonString)
      } else {
        reject("PASSKEY_FAILED", "Failed to serialize credential response", nil)
      }
    } onError: { error in
      if let authError = error as? ASAuthorizationError, authError.code == .canceled {
        reject("USER_CANCELLED", "User cancelled passkey assertion", error)
      } else {
        reject("PASSKEY_FAILED", error.localizedDescription, error)
      }
    }

    let controller = ASAuthorizationController(authorizationRequests: [assertionRequest])
    controller.delegate = delegate
    controller.presentationContextProvider = delegate
    objc_setAssociatedObject(controller, "delegate", delegate, .OBJC_ASSOCIATION_RETAIN_NONATOMIC)
    controller.performRequests()
  }
}

// MARK: - Authorization Delegate

@available(iOS 16.6, *)
private class AuthorizationDelegate: NSObject, ASAuthorizationControllerDelegate, ASAuthorizationControllerPresentationContextProviding {
  private let onSuccess: (ASAuthorizationCredential) -> Void
  private let onError: (Error) -> Void

  init(onSuccess: @escaping (ASAuthorizationCredential) -> Void, onError: @escaping (Error) -> Void) {
    self.onSuccess = onSuccess
    self.onError = onError
    super.init()
  }

  func authorizationController(controller: ASAuthorizationController, didCompleteWithAuthorization authorization: ASAuthorization) {
    onSuccess(authorization.credential)
  }

  func authorizationController(controller: ASAuthorizationController, didCompleteWithError error: Error) {
    onError(error)
  }

  func presentationAnchor(for controller: ASAuthorizationController) -> ASPresentationAnchor {
    return UIApplication.shared.connectedScenes
      .compactMap { $0 as? UIWindowScene }
      .flatMap { $0.windows }
      .first { $0.isKeyWindow } ?? ASPresentationAnchor()
  }
}

// MARK: - Data Base64URL Extensions

private extension Data {
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
