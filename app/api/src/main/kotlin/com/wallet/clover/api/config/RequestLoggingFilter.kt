package com.wallet.clover.api.config

import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import org.springframework.web.server.ServerWebExchange
import org.springframework.web.server.WebFilter
import org.springframework.web.server.WebFilterChain
import reactor.core.publisher.Mono

@Component
class RequestLoggingFilter : WebFilter {

    private val logger = LoggerFactory.getLogger(javaClass)

    override fun filter(exchange: ServerWebExchange, chain: WebFilterChain): Mono<Void> {
        val request = exchange.request
        val startTime = System.currentTimeMillis()

        return chain.filter(exchange).doOnSuccess {
            val duration = System.currentTimeMillis() - startTime
            logger.info(
                "Request: {} {} - Status: {} - Duration: {}ms",
                request.method,
                request.uri.path,
                exchange.response.statusCode,
                duration
            )
        }.doOnError { e ->
            val duration = System.currentTimeMillis() - startTime
            logger.error(
                "Request: {} {} - Status: {} - Duration: {}ms - Error: {}",
                request.method,
                request.uri.path,
                exchange.response.statusCode,
                duration,
                e.message
            )
        }
    }
}
