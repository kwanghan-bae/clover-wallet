package com.wallet.clover.api.repository.auth

import com.wallet.clover.api.entity.auth.RefreshTokenEntity
import org.springframework.data.repository.kotlin.CoroutineCrudRepository
import java.time.LocalDateTime

interface RefreshTokenRepository : CoroutineCrudRepository<RefreshTokenEntity, Long> {
    suspend fun findByToken(token: String): RefreshTokenEntity?
    suspend fun deleteByToken(token: String)
    suspend fun deleteByUserId(userId: Long)
    suspend fun deleteByExpiresAtBefore(date: LocalDateTime): Int
}
