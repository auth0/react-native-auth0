package com.auth0.react

import com.auth0.android.authentication.AuthenticationException
import com.facebook.react.bridge.JavaOnlyMap
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test
import java.io.IOException

class A0Auth0ModuleCredentialsErrorTest {

    @Test
    fun `authenticationErrorInfo passes the Auth0 error, its description and the status code`() {
        val cause = AuthenticationException(
            mapOf("error" to "access_denied", "error_description" to "Denied by a post-login Action"),
            403
        )

        val info = A0Auth0Module.authenticationErrorInfo(cause) { JavaOnlyMap() }!!

        assertEquals("access_denied", info.getString("error"))
        assertEquals("Denied by a post-login Action", info.getString("error_description"))
        assertEquals(403, info.getInt("statusCode"))
    }

    @Test
    fun `authenticationErrorInfo is null when the cause is not an Auth0 API error`() {
        assertNull(A0Auth0Module.authenticationErrorInfo(IOException("offline")) { JavaOnlyMap() })
        assertNull(A0Auth0Module.authenticationErrorInfo(null) { JavaOnlyMap() })
    }
}
