#include "pch.h"
#include "RNAuth0.h"

#include <winrt/Windows.ApplicationModel.h>
#include <winrt/Windows.Security.Cryptography.h>
#include <winrt/Windows.Security.Cryptography.Core.h>
#include <algorithm>
#include <cctype>
#include <string>

using namespace winrt::RNAuth0;

void A0Auth0::Init(ReactContext const& context) noexcept
{
    reactContext = context;
}

// String to lower case
static void toLowerCase(std::string& input)
{
    std::transform(input.begin(), input.end(), input.begin(),
        [](unsigned char c) { return (unsigned char)std::tolower(c); });
}

void A0Auth0::GetConstantProvider(ReactConstantProvider& provider) noexcept
{
    auto callbackUri = WebAuthenticationBroker::GetCurrentApplicationCallbackUri();
    JSValue callback(winrt::to_string(callbackUri.AbsoluteUri()));
    provider.Add(L"callbackUri", callback);
}

void A0Auth0::OAuthParameters(std::function<void(JSValueObject)> callback) noexcept
{
    const winrt::hstring verifier = GenerateRandomData();

    JSValueObject object;
    object["verifier"] = winrt::to_string(verifier);
    object["code_challenge"] = winrt::to_string(GenerateCodeChallenge(verifier));
    object["code_challenge_method"] = "S256";
    object["state"] = winrt::to_string(GenerateRandomData());
    callback(std::move(object));
}

// String Trim from end (in place)
static void rtrim(std::string& s, unsigned char trimChar)
{
    s.erase(std::find_if(s.rbegin(), s.rend(), [trimChar](unsigned char ch) {
        return ch != trimChar;
    }).base(), s.end());
}

// String Replace (in place)
static void replaceAll(std::string& subject, const std::string& search,
    const std::string& replace)
{
    size_t pos = 0;
    while ((pos = subject.find(search, pos)) != std::string::npos)
    {
        subject.replace(pos, search.length(), replace);
        pos += replace.length();
    }
}

// Converts the base64 input string to be URL-safe
// see: https://stackoverflow.com/a/26354677
void urlSafeBase64(std::string& input)
{
    rtrim(input, '=');
    replaceAll(input, "+", "-");
    replaceAll(input, "/", "_");
}

winrt::hstring A0Auth0::GenerateRandomData()
{
    IBuffer buffer = CryptographicBuffer::GenerateRandom(32);
    std::string base64 = winrt::to_string(CryptographicBuffer::EncodeToBase64String(buffer));
    urlSafeBase64(base64);

    return winrt::to_hstring(base64);
}

winrt::hstring A0Auth0::GenerateCodeChallenge(winrt::hstring codeVerifier)
{
    IBuffer data = CryptographicBuffer::ConvertStringToBinary(codeVerifier, BinaryStringEncoding::Utf8);
    auto hashAlgoProvider = HashAlgorithmProvider::OpenAlgorithm(L"SHA256");

    IBuffer shaData = hashAlgoProvider.HashData(data);
    std::string base64 = winrt::to_string(CryptographicBuffer::EncodeToBase64String(shaData));
    urlSafeBase64(base64);

    return winrt::to_hstring(base64);
}

void A0Auth0::ShowUrl(std::string url, std::function<void(JSValue, JSValue)> callback) noexcept
{
    AuthAsync(winrt::to_hstring(url), callback);
}

winrt::Windows::Foundation::IAsyncAction A0Auth0::AuthAsync(winrt::hstring url,
    std::function<void(JSValue, JSValue)> callback)
{
    try
    {
        Uri uri(url);
        WebAuthenticationOptions options{};
        WebAuthenticationResult result = co_await WebAuthenticationBroker::AuthenticateAsync(options, uri,
            WebAuthenticationBroker::GetCurrentApplicationCallbackUri());

        switch (result.ResponseStatus())
        {
        case WebAuthenticationStatus::Success:
        {
            JSValue error(nullptr);
            JSValue redirectURL(winrt::to_string(result.ResponseData()));
            callback(std::move(error), std::move(redirectURL));
            break;
        }
        case WebAuthenticationStatus::UserCancel:
        {
            JSValueObject error{};
            error["error"] = JSValue("a0.session.user_cancelled");
            error["error_description"] = JSValue("User cancelled the Auth");
            JSValue redirectURL(nullptr);
            callback(std::move(error), std::move(redirectURL));
            break;
        }
        case WebAuthenticationStatus::ErrorHttp:
        {
            JSValueObject error{};
            error["error"] = JSValue("a0.session.failed_load");
            error["error_description"] = JSValue("Failed to load url");
            JSValue redirectURL(nullptr);
            callback(std::move(error), std::move(redirectURL));
            break;
        }
        }
    }
    catch (winrt::hresult_error const& ex)
    {
    }
}

winrt::Windows::Foundation::IAsyncAction A0Auth0::LaunchUri(winrt::hstring url)
{
    Uri uri(url);
    co_await Windows::System::Launcher::LaunchUriAsync(uri);
}