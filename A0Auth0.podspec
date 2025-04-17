require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))
folly_compiler_flags = '-DFOLLY_NO_CONFIG -DFOLLY_MOBILE=1 -DFOLLY_USE_LIBCPP=1 -Wno-comma -Wno-shorten-64-to-32'

Pod::Spec.new do |s|
  s.name         = 'A0Auth0'
  s.version      = package['version']
  s.summary      = package['description']
  s.homepage     = package['repository']['baseUrl']
  s.license      = package['license']
  s.authors      = package['author']
  s.platforms    = { :ios => '13.0' }
  s.source       = { :git => 'https://github.com/auth0/react-native-auth0.git', :tag => "v#{s.version}" }

  s.source_files = 'ios/**/*.{h,m,mm,swift}'
  s.pod_target_xcconfig = { 'HEADER_SEARCH_PATHS' => "'${PODS_CONFIGURATION_BUILD_DIR}/#{s.name}/#{s.name}.framework/Headers'" }
  s.requires_arc = true

  s.dependency 'React-Core'
  s.dependency 'Auth0', '2.10'
  s.dependency 'JWTDecode', '3.2.0'
  s.dependency 'SimpleKeychain', '1.2.0'

  s.compiler_flags = folly_compiler_flags + " -DRCT_NEW_ARCH_ENABLED=1"
  s.pod_target_xcconfig    = {
      "HEADER_SEARCH_PATHS" => "\"$(PODS_ROOT)/boost\"",
      "OTHER_CPLUSPLUSFLAGS" => "-DFOLLY_NO_CONFIG -DFOLLY_MOBILE=1 -DFOLLY_USE_LIBCPP=1",
      "CLANG_CXX_LANGUAGE_STANDARD" => "c++17"
  }
  s.dependency "React-Codegen"
  s.dependency "RCT-Folly"
  s.dependency "RCTRequired"
  s.dependency "RCTTypeSafety"
  s.dependency "ReactCommon/turbomodule/core"
end
