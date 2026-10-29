import UIKit

/// Asks iOS for extra execution time while a Credentials Manager request is in flight.
///
/// A Credentials Manager request can exchange the refresh token. With refresh token rotation,
/// Auth0 replaces the refresh token as soon as it handles the exchange. If iOS suspends the app
/// after that, but before the response arrives and the new refresh token is stored, the
/// Credentials Manager keeps the old refresh token. Once the rotation overlap period has passed,
/// the next renewal sends that old token, Auth0's reuse detection revokes the whole token family,
/// and the user has to log in again.
///
/// The background task keeps the app running until the request finishes and its result is
/// stored, or until iOS expires the task. It does not change the request.
@MainActor
final class CredentialsBackgroundTask {
    private var identifier: UIBackgroundTaskIdentifier = .invalid

    init(name: String) {
        // UIApplication.shared is unavailable in app extensions, so look it up at runtime.
        guard let application = UIApplication.sharedApplicationIfAvailable() else { return }
        identifier = application.beginBackgroundTask(withName: name) {
            // iOS terminates the app if an expired task is not ended, so always end it here.
            self.end()
        }
    }

    /// Ends the background task. Safe to call more than once.
    func end() {
        guard identifier != .invalid else { return }
        UIApplication.sharedApplicationIfAvailable()?.endBackgroundTask(identifier)
        identifier = .invalid
    }
}

private extension UIApplication {
    static func sharedApplicationIfAvailable() -> UIApplication? {
        return UIApplication.perform(NSSelectorFromString("sharedApplication"))?.takeUnretainedValue() as? UIApplication
    }
}
