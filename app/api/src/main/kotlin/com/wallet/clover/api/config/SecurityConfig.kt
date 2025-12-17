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
import org.springframework.security.web.server.util.matcher.NegatedServerWebExchangeMatcher
import org.springframework.security.web.server.util.matcher.OrServerWebExchangeMatcher
import org.springframework.security.web.server.util.matcher.PathPatternParserServerWebExchangeMatcher
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
        // Define public paths that don't need JWT validation
        val publicPaths = OrServerWebExchangeMatcher(
            PathPatternParserServerWebExchangeMatcher("/api/v1/auth/**"),
            PathPatternParserServerWebExchangeMatcher("/actuator/health/**"),
            PathPatternParserServerWebExchangeMatcher("/actuator/info/**"),
            PathPatternParserServerWebExchangeMatcher("/webjars/**"),
            PathPatternParserServerWebExchangeMatcher("/v3/api-docs/**"),
            PathPatternParserServerWebExchangeMatcher("/swagger-ui.html"),
            PathPatternParserServerWebExchangeMatcher("/api/v1/admin/**")
        )
        
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
                    "/swagger-ui.html",
                    "/api/v1/admin/**"
                ).permitAll()
                it.anyExchange().authenticated()
            }
            .addFilterBefore(jwtBlacklistFilter, SecurityWebFiltersOrder.AUTHENTICATION)
            .oauth2ResourceServer { oauth2 ->
                oauth2.jwt { jwt ->
                    jwt.jwtDecoder(jwtDecoder())
                }
                // Only apply JWT validation to non-public paths
                oauth2.securityMatcher(NegatedServerWebExchangeMatcher(publicPaths))
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
        val secretBytes = java.util.Base64.getDecoder().decode(jwtProperties.secret)
        val secretKey = SecretKeySpec(secretBytes, "HmacSHA256")
        return NimbusReactiveJwtDecoder.withSecretKey(secretKey)
            .macAlgorithm(MacAlgorithm.HS256)
            .build()
    }
}
