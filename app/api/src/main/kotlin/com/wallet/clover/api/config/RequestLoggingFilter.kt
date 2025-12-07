package com.wallet.clover.api.config

import kotlinx.coroutines.reactor.mono
import kotlinx.coroutines.slf4j.MDCContext
import org.slf4j.LoggerFactory
import org.slf4j.MDC
import org.springframework.stereotype.Component
import org.springframework.web.server.ServerWebExchange
import org.springframework.web.server.WebFilter
import org.springframework.web.server.WebFilterChain
import reactor.core.publisher.Mono
import java.util.UUID

@Component
class RequestLoggingFilter : WebFilter {

    private val logger = LoggerFactory.getLogger(javaClass)

    override fun filter(exchange: ServerWebExchange, chain: WebFilterChain): Mono<Void> {
        val request = exchange.request
        val requestId = request.headers.getFirst("X-Request-ID") ?: UUID.randomUUID().toString()
        val startTime = System.currentTimeMillis()

        // MDC context propagation for Reactor
        return Mono.deferContextual { contextView ->
            MDC.put("requestId", requestId)
            chain.filter(exchange)
                .doOnSuccess {
                    val duration = System.currentTimeMillis() - startTime
                    logger.info(
                        "요청: {} {} - 상태: {} - 소요시간: {}ms",
                        request.method,
                        request.uri.path,
                        exchange.response.statusCode,
                        duration
                    )
                }
                .doOnError { e ->
                    val duration = System.currentTimeMillis() - startTime
                    logger.error(
                        "요청: {} {} - 상태: {} - 소요시간: {}ms - 에러: {}",
                        request.method,
                        request.uri.path,
                        exchange.response.statusCode,
                        duration,
                        e.message
                    )
                }
                .doFinally {
                    MDC.remove("requestId")
                }
                .contextWrite { it.put("requestId", requestId) }
        }
    }
}
