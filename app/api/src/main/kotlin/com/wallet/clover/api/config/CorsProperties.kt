package com.wallet.clover.api.config

import jakarta.validation.constraints.NotEmpty
import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.validation.annotation.Validated

@ConfigurationProperties(prefix = "cors")
@Validated
data class CorsProperties(
    @field:NotEmpty val allowedOrigins: List<String> = listOf("http://localhost:3000")
)
