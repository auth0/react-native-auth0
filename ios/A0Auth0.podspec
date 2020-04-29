require "json"

package = JSON.parse(File.read(File.join(__dir__, "../package.json")))

Pod::Spec.new do |s|
  s.name         = "A0Auth0"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = "https://github.com/auth0/react-native-auth0"
  s.license      = "MIT"
  s.license      = { :type => "MIT", :file => "../LICENSE" }
  s.authors      = { "Auth0" => "support@auth0.com" }
  s.platforms    = { :ios => "9.0" }
  s.source       = { :git => "https://github.com/auth0/react-native-auth0.git", :tag => "v#{s.version}" }

  s.source_files = "*.{h,m,swift}"
  s.requires_arc = true

  s.dependency "React"
end
