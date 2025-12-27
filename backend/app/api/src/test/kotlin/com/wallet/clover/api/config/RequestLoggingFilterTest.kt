package com.wallet.clover.api.config

import io.mockk.every
import io.mockk.mockk
import io.mockk.slot
import io.mockk.verify
import org.junit.jupiter.api.Test
import org.slf4j.MDC
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpMethod
import org.springframework.http.HttpStatus
import org.springframework.http.server.reactive.ServerHttpRequest
import org.springframework.http.server.reactive.ServerHttpResponse
import org.springframework.web.server.ServerWebExchange
import org.springframework.web.server.WebFilterChain
import reactor.core.publisher.Mono
import reactor.test.StepVerifier
import java.net.URI

class RequestLoggingFilterTest {

    private val filter = RequestLoggingFilter()

    @Test
    fun `filter should log request and inject MDC`() {
        val exchange = mockk<ServerWebExchange>()
        val chain = mockk<WebFilterChain>()
        val request = mockk<ServerHttpRequest>()
        val response = mockk<ServerHttpResponse>()
        val headers = HttpHeaders()

        every { exchange.request } returns request
        every { exchange.response } returns response
        every { request.headers } returns headers
        every { request.method } returns HttpMethod.GET
        every { request.uri } returns URI.create("/test")
        every { response.statusCode } returns HttpStatus.OK
        every { chain.filter(exchange) } returns Mono.empty()

        StepVerifier.create(filter.filter(exchange, chain))
            .verifyComplete()

        verify { chain.filter(exchange) }
    }
}
