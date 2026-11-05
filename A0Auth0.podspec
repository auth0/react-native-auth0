require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

Pod::Spec.new do |s|
  s.name         = 'A0Auth0'
  s.version      = package['version']
  s.summary      = package['description']
  s.homepage     = package['repository']['baseUrl']
  s.license      = package['license']
  s.authors      = package['author']
  s.platforms    = { :ios => min_ios_version_supported }
  s.swift_version = '6.0'
  s.source       = { :git => 'https://github.com/auth0/react-native-auth0.git', :tag => "v#{s.version}" }

  s.source_files = 'ios/**/*.{h,m,mm,swift}'
  s.resource_bundles = { 'A0Auth0_privacy' => 'ios/PrivacyInfo.xcprivacy' }
  s.requires_arc = true

  # Pulled via SPM since CocoaPods trunk is going read-only (2026-12-02)
  spm_dependency(s, url: 'https://github.com/auth0/Auth0.swift', requirement: { kind: 'exactVersion', version: '3.3.0' }, products: ['Auth0'])
  spm_dependency(s, url: 'https://github.com/auth0/JWTDecode.swift', requirement: { kind: 'exactVersion', version: '4.0.0' }, products: ['JWTDecode'])
  spm_dependency(s, url: 'https://github.com/auth0/SimpleKeychain', requirement: { kind: 'exactVersion', version: '1.3.0' }, products: ['SimpleKeychain'])

  install_modules_dependencies(s)
end
