package com.auth0.react

import com.auth0.android.authentication.passwordless.DeliveryMethod
import com.auth0.android.result.PasskeyVerificationMethod
import com.facebook.react.bridge.JavaOnlyArray
import com.facebook.react.bridge.JavaOnlyMap
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test

// Covers the pure helpers behind the passkey identifier-verification bridge code. The retryable
// rejection's userInfo is built from WritableNativeMap/Arguments, which need React Native's
// native libraries and cannot run in a plain JVM unit test.
class A0Auth0ModulePasskeyVerificationTest {

    @Test
    fun `verificationMethodNames returns the wire value of each method in order`() {
        val names = A0Auth0Module.verificationMethodNames(
            listOf(PasskeyVerificationMethod.PHONE, PasskeyVerificationMethod.EMAIL)
        )

        assertEquals(listOf("phone", "email"), names)
    }

    @Test
    fun `verificationMethodNames drops the nulls Gson leaves for unknown identifiers`() {
        val names = A0Auth0Module.verificationMethodNames(
            listOf(PasskeyVerificationMethod.EMAIL, null)
        )

        assertEquals(listOf("email"), names)
    }

    @Test
    fun `verificationMethodNames is empty for a null or empty list`() {
        assertEquals(emptyList<String>(), A0Auth0Module.verificationMethodNames(null))
        assertEquals(emptyList<String>(), A0Auth0Module.verificationMethodNames(emptyList()))
    }

    @Test
    fun `verificationCodes maps the known identifiers to their codes`() {
        val codes = A0Auth0Module.verificationCodes(JavaOnlyMap.of("email", "123456", "phone", "654321"))

        assertEquals(
            mapOf(
                PasskeyVerificationMethod.EMAIL to "123456",
                PasskeyVerificationMethod.PHONE to "654321"
            ),
            codes
        )
    }

    @Test
    fun `verificationCodes drops unknown identifiers`() {
        val codes = A0Auth0Module.verificationCodes(JavaOnlyMap.of("email", "123456", "username", "111111"))

        assertEquals(mapOf(PasskeyVerificationMethod.EMAIL to "123456"), codes)
    }

    @Test
    fun `verificationCodes is empty for a missing map, an empty map or only unknown identifiers`() {
        assertEquals(emptyMap<PasskeyVerificationMethod, String>(), A0Auth0Module.verificationCodes(null))
        assertEquals(emptyMap<PasskeyVerificationMethod, String>(), A0Auth0Module.verificationCodes(JavaOnlyMap()))
        assertEquals(
            emptyMap<PasskeyVerificationMethod, String>(),
            A0Auth0Module.verificationCodes(JavaOnlyMap.of("username", "111111"))
        )
    }

    @Test
    fun `verificationMethods maps the known identifiers in order`() {
        val methods = A0Auth0Module.verificationMethods(JavaOnlyArray.of("phone", "email"))

        assertEquals(listOf(PasskeyVerificationMethod.PHONE, PasskeyVerificationMethod.EMAIL), methods)
    }

    @Test
    fun `verificationMethods drops unknown identifiers and values that are not strings`() {
        val methods = A0Auth0Module.verificationMethods(JavaOnlyArray.of("email", "username", 7, null))

        assertEquals(listOf(PasskeyVerificationMethod.EMAIL), methods)
    }

    @Test
    fun `verificationMethods is empty for a missing array, an empty array or only unknown identifiers`() {
        assertEquals(emptyList<PasskeyVerificationMethod>(), A0Auth0Module.verificationMethods(null))
        assertEquals(emptyList<PasskeyVerificationMethod>(), A0Auth0Module.verificationMethods(JavaOnlyArray()))
        assertEquals(
            emptyList<PasskeyVerificationMethod>(),
            A0Auth0Module.verificationMethods(JavaOnlyArray.of("username"))
        )
    }

    @Test
    fun `deliveryMethodFrom matches the wire value of each DeliveryMethod`() {
        DeliveryMethod.values().forEach { method ->
            assertEquals(method, A0Auth0Module.deliveryMethodFrom(method.value))
        }
    }

    @Test
    fun `deliveryMethodFrom trims whitespace around the value`() {
        val method = DeliveryMethod.values().first()

        assertEquals(method, A0Auth0Module.deliveryMethodFrom("  ${method.value}  "))
    }

    @Test
    fun `deliveryMethodFrom falls back to null for a missing or unknown value`() {
        assertNull(A0Auth0Module.deliveryMethodFrom(null))
        assertNull(A0Auth0Module.deliveryMethodFrom(""))
        assertNull(A0Auth0Module.deliveryMethodFrom("carrier_pigeon"))
    }
}
