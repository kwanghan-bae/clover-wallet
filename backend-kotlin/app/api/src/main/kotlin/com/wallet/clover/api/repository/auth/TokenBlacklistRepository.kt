package com.wallet.clover.api.repository.auth

import com.wallet.clover.api.entity.auth.TokenBlacklistEntity
import org.springframework.data.repository.kotlin.CoroutineCrudRepository
import java.time.LocalDateTime

interface TokenBlacklistRepository : CoroutineCrudRepository<TokenBlacklistEntity, Long> {
    suspend fun existsByToken(token: String): Boolean
    suspend fun deleteByExpiresAtBefore(date: LocalDateTime): Int
}
