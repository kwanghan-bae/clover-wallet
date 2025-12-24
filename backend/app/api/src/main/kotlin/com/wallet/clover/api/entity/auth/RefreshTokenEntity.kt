package com.wallet.clover.api.entity.auth

import org.springframework.data.annotation.Id
import org.springframework.data.relational.core.mapping.Table
import java.time.LocalDateTime

@Table("refresh_token")
data class RefreshTokenEntity(
    @Id val id: Long? = null,
    val userId: Long,
    val token: String,
    val expiresAt: LocalDateTime,
    val createdAt: LocalDateTime = LocalDateTime.now()
)
