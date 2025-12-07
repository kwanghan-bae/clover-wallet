package com.wallet.clover.api.config

import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity
import org.springframework.security.config.web.server.SecurityWebFiltersOrder
import org.springframework.security.config.web.server.ServerHttpSecurity
import org.springframework.security.oauth2.jose.jws.MacAlgorithm
import org.springframework.security.oauth2.jwt.NimbusReactiveJwtDecoder
import org.springframework.security.oauth2.jwt.ReactiveJwtDecoder
import org.springframework.security.web.server.SecurityWebFilterChain
import java.nio.charset.StandardCharsets
import javax.crypto.spec.SecretKeySpec

@Configuration
@EnableWebFluxSecurity
class SecurityConfig(
    @Value("\${jwt.secret}") private val jwtSecret: String,
    private val jwtBlacklistFilter: JwtBlacklistFilter
) {

    @Bean
    fun springSecurityFilterChain(http: ServerHttpSecurity): SecurityWebFilterChain {
        return http
            .csrf { it.disable() }
            .headers { headers ->
                headers.frameOptions { it.mode(org.springframework.security.web.server.header.XFrameOptionsServerHttpHeadersWriter.Mode.DENY) }
                headers.xssProtection { it.disable() }
                headers.contentSecurityPolicy { it.policyDirectives("default-src 'self'") }
                headers.hsts { it.includeSubdomains(true).maxAge(java.time.Duration.ofDays(365)) }
            }
            .authorizeExchange {
                it.pathMatchers(
                    "/api/v1/auth/**",
                    "/actuator/health/**",
                    "/actuator/info/**",
                    "/webjars/**",
                    "/v3/api-docs/**",
                    "/swagger-ui.html"
                ).permitAll()
                it.anyExchange().authenticated()
            }
            .addFilterBefore(jwtBlacklistFilter, SecurityWebFiltersOrder.AUTHENTICATION)
            .oauth2ResourceServer { oauth2 ->
                oauth2.jwt { jwt ->
                    jwt.jwtDecoder(jwtDecoder())
                }
            }
            .build()
    }

    @Bean
    fun jwtDecoder(): ReactiveJwtDecoder {
        val secretKey = SecretKeySpec(jwtSecret.toByteArray(StandardCharsets.UTF_8), "HmacSHA256")
        return NimbusReactiveJwtDecoder.withSecretKey(secretKey)
            .macAlgorithm(MacAlgorithm.HS256)
            .build()
    }
}
