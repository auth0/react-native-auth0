package com.auth0.react

import com.auth0.android.request.HttpMethod
import com.auth0.android.request.RequestOptions
import com.facebook.react.bridge.JavaOnlyMap
import okhttp3.mockwebserver.MockResponse
import okhttp3.mockwebserver.MockWebServer
import org.junit.After
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Assert.fail
import org.junit.Before
import org.junit.Test
import java.io.IOException
import java.util.concurrent.TimeUnit
import java.util.logging.Handler
import java.util.logging.Level
import java.util.logging.LogRecord
import java.util.logging.Logger
import kotlin.system.measureTimeMillis

// Proves that A0Auth0Module.buildNetworkingClient() genuinely threads networkingOptions
// into the DefaultClient it builds, rather than just compiling. Exercises the client against a
// real (local) server so the OkHttp timeout machinery actually runs.
class A0Auth0ModuleNetworkingOptionsTest {

    private lateinit var server: MockWebServer
    private lateinit var logCapture: LogCapture
    private lateinit var okHttpLogger: Logger

    @Before
    fun setUp() {
        server = MockWebServer()
        server.start()

        // Set up log capture for OkHttp's HttpLoggingInterceptor
        // Capture at root logger level to catch all logging regardless of hierarchy
        logCapture = LogCapture()
        okHttpLogger = Logger.getLogger("")  // Root logger catches everything
        okHttpLogger.level = Level.ALL
        okHttpLogger.addHandler(logCapture)
    }

    @After
    fun tearDown() {
        server.shutdown()
        okHttpLogger.removeHandler(logCapture)
    }

    /**
     * Captures java.util.logging records so we can verify Auth0.Android's
     * HttpLoggingInterceptor is (or isn't) writing request/response bodies.
     */
    private class LogCapture : Handler() {
        private val records = mutableListOf<LogRecord>()

        override fun publish(record: LogRecord) {
            records.add(record)
        }

        override fun flush() {}
        override fun close() {}

        fun hasRequestOrResponseBodyLogs(): Boolean {
            return records.any { record ->
                val message = record.message ?: ""
                val loggerName = record.loggerName ?: ""

                (loggerName.contains("okhttp", ignoreCase = true) ||
                 loggerName.contains("http", ignoreCase = true)) &&
                (message.contains("--> ") ||      // Request line: "--> GET /token"
                 message.contains("<-- ") ||      // Response line: "<-- 200 OK"
                 message.contains("Content-") ||  // Headers like Content-Type, Content-Length
                 message.contains("access_token") || // Response body content
                 message.contains("{\""))         // JSON body start
            }
        }

        fun getAllLogMessages(): String {
            return records.joinToString("\n") { record ->
                "[${record.loggerName}] ${record.message}"
            }
        }

        fun clear() {
            records.clear()
        }
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
        server.enqueue(MockResponse().setBody("""{"access_token": "secret123"}"""))

        logCapture.clear()

        // SECURITY: If the isDebuggable gate is ever removed, Auth0.Android attaches its
        // logging interceptor which logs full request/response bodies (including tokens).
        // Auth0.Android's interceptor writes through java.util.logging, not android.util.Log,
        // so we must assert on captured log records rather than relying on a crash.
        val client = A0Auth0Module.buildNetworkingClient(
            JavaOnlyMap.of("enableLogging", true),
            isDebuggable = false
        )

        client.load(server.url("/token").toString(), RequestOptions(HttpMethod.GET))

        // Verify that NO request/response body logs were written. If the isDebuggable gate
        // is removed, this assertion will fail because the interceptor will log the response
        // body containing "access_token": "secret123".
        assertFalse(
            "Expected no HTTP body logs on non-debuggable build, but logging was enabled",
            logCapture.hasRequestOrResponseBodyLogs()
        )
    }

    @Test
    fun `enableLogging actually logs request and response bodies on debuggable builds`() {
        server.enqueue(MockResponse().setBody("""{"access_token": "secret456"}"""))

        logCapture.clear()

        // Positive test: verify that enableLogging actually works when isDebuggable = true.
        val client = A0Auth0Module.buildNetworkingClient(
            JavaOnlyMap.of("enableLogging", true),
            isDebuggable = true
        )

        client.load(server.url("/token").toString(), RequestOptions(HttpMethod.GET))

        // The interceptor should have logged the request and response, proving that:
        // (a) our test harness correctly captures logs, and
        // (b) the enableLogging option genuinely enables logging when allowed.
        val allLogs = logCapture.getAllLogMessages()
        assertTrue(
            "Expected HTTP body logs on debuggable build with enableLogging=true. Captured logs:\n$allLogs",
            logCapture.hasRequestOrResponseBodyLogs()
        )
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
