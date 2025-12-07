package com.wallet.clover.api.service

import com.wallet.clover.api.dto.Auth
import com.wallet.clover.api.entity.user.UserEntity
import com.wallet.clover.api.entity.auth.RefreshTokenEntity
import com.wallet.clover.api.common.UserDefaults
import com.wallet.clover.api.repository.user.UserRepository
import com.wallet.clover.api.repository.auth.RefreshTokenRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@Service
class AuthService(
    private val userRepository: UserRepository,
    private val jwtService: JwtService,
    private val refreshTokenRepository: RefreshTokenRepository,
    private val tokenBlacklistService: TokenBlacklistService
) {
    
    // TODO: 실제 JWT 라이브러리 구현 완료 후 테스트 필요
    // TODO: 프로덕션 배포 시 Secret Key를 환경변수로 변경
    
    /**
     * 로그인: Access Token + Refresh Token 발급
     */
    @Transactional
    suspend fun login(ssoQualifier: String): Auth.LoginResponse {
        val user = userRepository.findBySsoQualifier(ssoQualifier)
            ?: userRepository.save(
                UserEntity(
                    ssoQualifier = ssoQualifier,
                    age = UserDefaults.DEFAULT_AGE,
                    locale = UserDefaults.DEFAULT_LOCALE
                )
            )
        
        val accessToken = jwtService.generateAccessToken(user.id!!)
        val refreshToken = jwtService.generateRefreshToken(user.id)
        
        // Refresh Token DB 저장
        refreshTokenRepository.save(
            RefreshTokenEntity(
                userId = user.id,
                token = refreshToken,
                expiresAt = jwtService.getRefreshTokenExpiry()
            )
        )
        
        return Auth.LoginResponse(
            accessToken = accessToken,
            refreshToken = refreshToken,
            user = user
        )
    }
    
    /**
     * Refresh: Access Token 갱신
     */
    suspend fun refresh(refreshToken: String): Auth.RefreshResponse {
        // 1. Refresh Token 검증
        val userId = jwtService.validateRefreshToken(refreshToken)
        
        // 2. DB에서 Refresh Token 확인
        val storedToken = refreshTokenRepository.findByToken(refreshToken)
            ?: throw IllegalArgumentException("Invalid refresh token")
        
        // 3. 만료 확인
        if (storedToken.expiresAt.isBefore(LocalDateTime.now())) {
            refreshTokenRepository.deleteByToken(refreshToken)
            throw IllegalArgumentException("Refresh token expired")
        }
        
        // 4. 새 Access Token 발급
        val newAccessToken = jwtService.generateAccessToken(userId)
        
        return Auth.RefreshResponse(accessToken = newAccessToken)
    }
    
    /**
     * Logout: 토큰 무효화
     */
    suspend fun logout(accessToken: String, refreshToken: String) {
        // 1. Access Token을 Blacklist에 추가
        tokenBlacklistService.addToBlacklist(accessToken)
        
        // 2. Refresh Token 삭제
        refreshTokenRepository.deleteByToken(refreshToken)
    }
}
