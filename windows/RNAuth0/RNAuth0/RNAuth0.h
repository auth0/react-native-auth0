#pragma once

#include "pch.h"
#include "NativeModules.h"

using namespace winrt::Microsoft::ReactNative;
using namespace winrt::Windows::Security::Authentication::Web;
using namespace winrt::Windows::Security::Cryptography;
using namespace winrt::Windows::Security::Cryptography::Core;
using namespace winrt::Windows::Storage::Streams;

#ifdef RNW61
#define JSVALUEOBJECTPARAMETER
#else
#define JSVALUEOBJECTPARAMETER const &
#endif

namespace winrt::RNAuth0 {
  REACT_MODULE(A0Auth0);
  struct A0Auth0 {
    const std::string Name = "A0Auth0";
    ReactContext reactContext = nullptr;

    REACT_INIT(Init);
    void Init(ReactContext const& context) noexcept;

    REACT_CONSTANT_PROVIDER(GetConstantProvider)
    void GetConstantProvider(ReactConstantProvider& provider) noexcept;

    REACT_METHOD(OAuthParameters, L"oauthParameters");
    void OAuthParameters(std::function<void(JSValueObject)> callback) noexcept;

    REACT_METHOD(ShowUrl, L"showUrl");
    void ShowUrl(std::string url, std::function<void(JSValue, JSValue)> callback) noexcept;

    static winrt::hstring GenerateRandomData();
    static winrt::hstring GenerateCodeChallenge(winrt::hstring codeVerifier);
    IAsyncAction LaunchUri(winrt::hstring uri);
    IAsyncAction AuthAsync(winrt::hstring uri, std::function<void(JSValue, JSValue)> callback);
  };
}
