package com.wallet.clover.api.service

import com.wallet.clover.api.entity.auth.TokenBlacklistEntity
import com.wallet.clover.api.repository.auth.TokenBlacklistRepository
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Service
import java.time.LocalDateTime

@Service
class TokenBlacklistService(
    private val tokenBlacklistRepository: TokenBlacklistRepository,
    private val jwtService: JwtService
) {
    
    /**
     * Blacklist에 토큰 추가 (로그아웃 시)
     */
    suspend fun addToBlacklist(token: String) {
        val expiresAt = jwtService.getAccessTokenExpiry()
        tokenBlacklistRepository.save(
            TokenBlacklistEntity(
                token = token,
                expiresAt = expiresAt
            )
        )
    }
    
    /**
     * Blacklist에 토큰이 있는지 확인
     */
    suspend fun isBlacklisted(token: String): Boolean {
        return tokenBlacklistRepository.existsByToken(token)
    }
    
    /**
     * 만료된 Blacklist 항목 정리 (매 시간 실행)
     */
    @Scheduled(cron = "0 0 * * * *")
    suspend fun cleanupExpiredTokens() {
        val deletedCount = tokenBlacklistRepository.deleteByExpiresAtBefore(LocalDateTime.now())
        println("Cleaned up $deletedCount expired blacklist tokens")
    }
}
