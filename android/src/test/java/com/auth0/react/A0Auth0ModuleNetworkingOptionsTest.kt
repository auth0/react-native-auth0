package com.auth0.react

import com.auth0.android.request.HttpMethod
import com.auth0.android.request.RequestOptions
import com.facebook.react.bridge.JavaOnlyMap
import okhttp3.mockwebserver.MockResponse
import okhttp3.mockwebserver.MockWebServer
import org.junit.After
import org.junit.Assert.assertTrue
import org.junit.Assert.fail
import org.junit.Before
import org.junit.Test
import java.io.IOException
import java.util.concurrent.TimeUnit
import kotlin.system.measureTimeMillis

// Proves that A0Auth0Module.buildNetworkingClient() genuinely threads networkingOptions
// into the DefaultClient it builds, rather than just compiling. Exercises the client against a
// real (local) server so the OkHttp timeout machinery actually runs.
class A0Auth0ModuleNetworkingOptionsTest {

    private lateinit var server: MockWebServer

    @Before
    fun setUp() {
        server = MockWebServer()
        server.start()
    }

    @After
    fun tearDown() {
        server.shutdown()
    }

    @Test
    fun `readTimeout from networkingOptions is applied to the built DefaultClient`() {
        val configuredTimeoutSeconds = 1
        // Stall the response well past the configured timeout.
        server.enqueue(MockResponse().setHeadersDelay(3, TimeUnit.SECONDS).setBody("{}"))

        val client = A0Auth0Module.buildNetworkingClient(
            JavaOnlyMap.of("readTimeout", configuredTimeoutSeconds),
            isDebuggable = true
        )

        var threw = false
        val elapsedMillis = measureTimeMillis {
            try {
                client.load(server.url("/").toString(), RequestOptions(HttpMethod.GET))
                fail("Expected the configured read timeout to fire")
            } catch (e: IOException) {
                threw = true
            }
        }

        assertTrue("Expected an IOException from the read timeout", threw)
        // The server stalls for 3s; a working 1s readTimeout must fire well before that.
        assertTrue(
            "Expected the call to fail near the configured ${configuredTimeoutSeconds}s timeout, took ${elapsedMillis}ms",
            elapsedMillis < TimeUnit.SECONDS.toMillis(2)
        )
    }

    @Test
    fun `defaultHeaders from networkingOptions are sent on every request`() {
        server.enqueue(MockResponse().setBody("{}"))

        val client = A0Auth0Module.buildNetworkingClient(
            JavaOnlyMap.of("defaultHeaders", JavaOnlyMap.of("X-Custom-Header", "custom-value")),
            isDebuggable = true
        )

        client.load(server.url("/").toString(), RequestOptions(HttpMethod.GET))

        val recordedRequest = server.takeRequest()
        assertTrue(recordedRequest.getHeader("X-Custom-Header") == "custom-value")
    }

    @Test
    fun `enableLogging is ignored on a non-debuggable build even when requested`() {
        server.enqueue(MockResponse().setBody("{}"))

        // If the debuggable gate is ever removed, Auth0.Android attaches its logging
        // interceptor and this request crashes ("Method ... not mocked") because
        // android.util.Log isn't stubbed in this unit test environment - that crash is
        // exactly the regression this test is meant to catch.
        val client = A0Auth0Module.buildNetworkingClient(
            JavaOnlyMap.of("enableLogging", true),
            isDebuggable = false
        )

        client.load(server.url("/").toString(), RequestOptions(HttpMethod.GET))

        val recordedRequest = server.takeRequest()
        assertTrue(recordedRequest.method == "GET")
    }

    @Test
    fun `re-initializing with the same configuration but no options restores the default client`() {
        // First "initialization": custom options give a 1s readTimeout.
        val customized = A0Auth0Module.resolveNetworkingClient(
            JavaOnlyMap.of("readTimeout", 1),
            isDebuggable = true
        )

        // Re-initialization with the same clientId/domain but networkingOptions omitted
        // must not carry the previous readTimeout forward - it should behave like a fresh
        // DefaultClient() (10s default readTimeout).
        val reset = A0Auth0Module.resolveNetworkingClient(null, isDebuggable = true)

        server.enqueue(MockResponse().setHeadersDelay(3, TimeUnit.SECONDS).setBody("{}"))
        var threw = false
        try {
            customized.load(server.url("/").toString(), RequestOptions(HttpMethod.GET))
        } catch (e: IOException) {
            threw = true
        }
        assertTrue("Expected the 1s readTimeout to fire on the customized client", threw)

        server.enqueue(MockResponse().setHeadersDelay(3, TimeUnit.SECONDS).setBody("{}"))
        // Should comfortably survive the 3s delay under the restored 10s default readTimeout.
        reset.load(server.url("/").toString(), RequestOptions(HttpMethod.GET))
    }
}
