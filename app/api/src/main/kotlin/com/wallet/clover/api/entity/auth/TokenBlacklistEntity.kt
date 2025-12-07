package com.wallet.clover.api.entity.auth

import org.springframework.data.annotation.Id
import org.springframework.data.relational.core.mapping.Table
import java.time.LocalDateTime

@Table("token_blacklist")
data class TokenBlacklistEntity(
    @Id val id: Long? = null,
    val token: String,
    val expiresAt: LocalDateTime,
    val createdAt: LocalDateTime = LocalDateTime.now()
)
