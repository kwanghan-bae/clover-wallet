package com.wallet.clover.api.config

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

import org.springframework.boot.context.properties.EnableConfigurationProperties

@Configuration
@EnableWebFluxSecurity
@EnableConfigurationProperties(JwtProperties::class)
class SecurityConfig(
    private val jwtProperties: JwtProperties,
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
                // Public Endpoints - JWT validation failures are ignored for these
                it.pathMatchers(
                    "/api/v1/auth/**",
                    "/actuator/health/**",
                    "/actuator/info/**",
                    "/webjars/**",
                    "/v3/api-docs/**",
                    "/swagger-ui.html",
                    "/api/v1/admin/**"
                ).permitAll()
                // All other endpoints require authentication
                it.anyExchange().authenticated()
            }
            .addFilterBefore(jwtBlacklistFilter, SecurityWebFiltersOrder.AUTHENTICATION)
            .oauth2ResourceServer { oauth2 ->
                oauth2.jwt { jwt ->
                    jwt.jwtDecoder(jwtDecoder())
                }
            }
            .cors { it.configurationSource(corsConfigurationSource()) }
            .build()
    }

    @Bean
    fun corsConfigurationSource(): org.springframework.web.cors.reactive.CorsConfigurationSource {
        val configuration = org.springframework.web.cors.CorsConfiguration()
        configuration.allowedOrigins = listOf("*")
        configuration.allowedMethods = listOf("GET", "POST", "PUT", "DELETE", "OPTIONS")
        configuration.allowedHeaders = listOf("*")
        val source = org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource()
        source.registerCorsConfiguration("/**", configuration)
        return source
    }

    @Bean
    fun jwtDecoder(): ReactiveJwtDecoder {
        // Supabase JWT Secret은 평문 문자열이므로 Base64 디코딩 없이 직접 사용
        val secretBytes = jwtProperties.secret.toByteArray(StandardCharsets.UTF_8)
        val secretKey = SecretKeySpec(secretBytes, "HmacSHA256")
        return NimbusReactiveJwtDecoder.withSecretKey(secretKey)
            .macAlgorithm(MacAlgorithm.HS256)
            .build()
    }
}
