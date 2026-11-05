// swift-tools-version: 6.0
// Version source for the Auth0 iOS dependencies. Dependabot bumps the pins here and
// scripts/sync-ios-deps.sh copies them into A0Auth0.podspec. Not shipped or built.
import PackageDescription

let package = Package(
    name: "A0Auth0Versions",
    platforms: [.iOS(.v15)],
    dependencies: [
        .package(url: "https://github.com/auth0/Auth0.swift", exact: "3.3.0"),
        .package(url: "https://github.com/auth0/JWTDecode.swift", exact: "4.0.0"),
        .package(url: "https://github.com/auth0/SimpleKeychain", exact: "1.3.0"),
    ],
    targets: [
        .target(
            name: "Stub",
            dependencies: [
                .product(name: "Auth0", package: "Auth0.swift"),
                .product(name: "JWTDecode", package: "JWTDecode.swift"),
                .product(name: "SimpleKeychain", package: "SimpleKeychain"),
            ]
        ),
    ]
)
