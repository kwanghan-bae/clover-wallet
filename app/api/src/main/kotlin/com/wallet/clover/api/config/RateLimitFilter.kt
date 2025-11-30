package com.wallet.clover.api.config

import com.github.benmanes.caffeine.cache.Caffeine
import io.github.bucket4j.Bandwidth
import io.github.bucket4j.Bucket
import org.springframework.stereotype.Component
import org.springframework.web.server.ServerWebExchange
import org.springframework.web.server.WebFilter
import org.springframework.web.server.WebFilterChain
import reactor.core.publisher.Mono
import java.time.Duration
import java.util.concurrent.TimeUnit

@Component
class RateLimitFilter : WebFilter {

    private val buckets = Caffeine.newBuilder()
        .expireAfterAccess(1, TimeUnit.HOURS)
        .build<String, Bucket> { _ -> createNewBucket() }

    override fun filter(exchange: ServerWebExchange, chain: WebFilterChain): Mono<Void> {
        val ip = exchange.request.remoteAddress?.address?.hostAddress ?: "unknown"
        val bucket = buckets.get(ip)

        return if (bucket.tryConsume(1)) {
            chain.filter(exchange)
        } else {
            exchange.response.statusCode = org.springframework.http.HttpStatus.TOO_MANY_REQUESTS
            exchange.response.setComplete()
        }
    }

    private fun createNewBucket(): Bucket {
        // 100 requests per minute
        val limit = Bandwidth.builder()
            .capacity(100)
            .refillGreedy(100, Duration.ofMinutes(1))
            .build()
        return Bucket.builder().addLimit(limit).build()
    }
}
