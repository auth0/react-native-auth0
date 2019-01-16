require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "A0Auth0"
  s.version      = package["version"]
  s.summary      = "A0Auth0"
  s.homepage     = "https://github.com/auth0/react-native-auth0"
  s.license      = "MIT"
  s.author             = { "auth0" => "oss@auth0.com" }
  s.platform     = :ios, "7.0"
  s.source       = { :git => "https://github.com/auth0/react-native-auth0.git", :tag => "v#{s.version}" }
  s.source_files  = "ios/*.{h,m}"
  s.requires_arc = true
end

