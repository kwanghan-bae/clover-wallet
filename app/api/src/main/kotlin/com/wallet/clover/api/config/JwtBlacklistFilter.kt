package com.wallet.clover.api.config

import com.wallet.clover.api.service.TokenBlacklistService
import kotlinx.coroutines.reactor.mono
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Component
import org.springframework.web.server.ServerWebExchange
import org.springframework.web.server.WebFilter
import org.springframework.web.server.WebFilterChain
import reactor.core.publisher.Mono

@Component
class JwtBlacklistFilter(
    private val tokenBlacklistService: TokenBlacklistService
) : WebFilter {

    override fun filter(exchange: ServerWebExchange, chain: WebFilterChain): Mono<Void> {
        val authHeader = exchange.request.headers.getFirst(HttpHeaders.AUTHORIZATION)
        
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            val token = authHeader.substring(7)
            
            return mono {
                tokenBlacklistService.isBlacklisted(token)
            }.flatMap { isBlacklisted ->
                if (isBlacklisted) {
                    exchange.response.statusCode = HttpStatus.UNAUTHORIZED
                    exchange.response.setComplete()
                } else {
                    chain.filter(exchange)
                }
            }
        }
        
        return chain.filter(exchange)
    }
}
