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
                // Public Endpoints
                it.pathMatchers(
                    "/api/v1/auth/**",
                    "/actuator/health/**",
                    "/actuator/info/**",
                    "/webjars/**",
                    "/v3/api-docs/**",
                    "/swagger-ui.html",
                    // Admin Init APIs (Temporary Open for manual curl)
                    "/api/v1/admin/**"
                ).permitAll()
                it.anyExchange().authenticated()
            }
            .addFilterBefore(jwtBlacklistFilter, SecurityWebFiltersOrder.AUTHENTICATION)
            .oauth2ResourceServer { oauth2 ->
                oauth2.jwt { jwt ->
                    jwt.jwtDecoder(jwtDecoder())
                }
                // Configure to handle authentication failures gracefully for public endpoints
                oauth2.authenticationEntryPoint { exchange, _ ->
                    // Check if this is a public endpoint
                    val path = exchange.request.path.toString()
                    val isPublicPath = path.startsWith("/api/v1/auth/") || 
                                      path.startsWith("/actuator/health") ||
                                      path.startsWith("/actuator/info") ||
                                      path.startsWith("/api/v1/admin/")
                    
                    if (isPublicPath) {
                        // For public paths, don't fail on JWT errors - let the request through
                        reactor.core.publisher.Mono.empty()
                    } else {
                        // For protected paths, return 401
                        exchange.response.statusCode = org.springframework.http.HttpStatus.UNAUTHORIZED
                        exchange.response.setComplete()
                    }
                }
            }
            .cors { it.configurationSource(corsConfigurationSource()) }
            .build()
    }

    @Bean
    fun corsConfigurationSource(): org.springframework.web.cors.reactive.CorsConfigurationSource {
        val configuration = org.springframework.web.cors.CorsConfiguration()
        configuration.allowedOrigins = listOf("*") // 개발 중 편의를 위해 모든 출처 허용 (배포 시 수정 권장)
        configuration.allowedMethods = listOf("GET", "POST", "PUT", "DELETE", "OPTIONS")
        configuration.allowedHeaders = listOf("*")
        val source = org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource()
        source.registerCorsConfiguration("/**", configuration)
        return source
    }

    @Bean
    fun jwtDecoder(): ReactiveJwtDecoder {
        val secretBytes = java.util.Base64.getDecoder().decode(jwtProperties.secret)
        val secretKey = SecretKeySpec(secretBytes, "HmacSHA256")
        return NimbusReactiveJwtDecoder.withSecretKey(secretKey)
            .macAlgorithm(MacAlgorithm.HS256)
            .build()
    }
}
