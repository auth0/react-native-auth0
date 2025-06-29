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
  s.swift_version = '5.0'
  s.source       = { :git => 'https://github.com/auth0/react-native-auth0.git', :tag => "v#{s.version}" }

  s.source_files = 'ios/**/*.{h,m,mm,swift}'
  s.requires_arc = true

  s.dependency 'Auth0', '2.10'
  s.dependency 'JWTDecode', '3.2.0'
  s.dependency 'SimpleKeychain', '1.2.0'
  
  install_modules_dependencies(s)
end
