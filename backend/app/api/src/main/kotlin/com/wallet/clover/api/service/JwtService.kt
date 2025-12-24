package com.wallet.clover.api.service

import io.jsonwebtoken.Jwts
import io.jsonwebtoken.security.Keys
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import java.time.LocalDateTime
import java.time.ZoneId
import java.util.*
import javax.crypto.SecretKey

@Service
class JwtService(
    @Value("\${jwt.secret}") private val secretKeyString: String,
    @Value("\${jwt.access-token-validity}") private val accessTokenValidity: Long,
    @Value("\${jwt.refresh-token-validity}") private val refreshTokenValidity: Long
) {

    private val key: SecretKey by lazy {
        Keys.hmacShaKeyFor(secretKeyString.toByteArray())
    }

    /**
     * Access Token 생성
     */
    fun generateAccessToken(userId: Long): String {
        return Jwts.builder()
            .subject(userId.toString())
            .issuedAt(Date())
            .expiration(Date(System.currentTimeMillis() + accessTokenValidity))
            .signWith(key)
            .compact()
    }
    
    /**
     * Refresh Token 생성
     */
    fun generateRefreshToken(userId: Long): String {
        return Jwts.builder()
            .subject(userId.toString())
            .issuedAt(Date())
            .expiration(Date(System.currentTimeMillis() + refreshTokenValidity))
            .id(UUID.randomUUID().toString()) // JTI
            .signWith(key)
            .compact()
    }
    
    /**
     * Access Token 검증 및 userId 추출
     */
    fun validateAccessToken(token: String): Long {
        return parseToken(token)
    }
    
    /**
     * Refresh Token 검증 및 userId 추출
     */
    fun validateRefreshToken(token: String): Long {
        return parseToken(token)
    }
    
    private fun parseToken(token: String): Long {
        try {
            val claims = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .payload
            
            return claims.subject.toLong()
        } catch (e: Exception) {
            throw IllegalArgumentException("유효하지 않거나 만료된 토큰입니다", e)
        }
    }
    
    /**
     * Token 만료 시간 계산
     */
    fun getAccessTokenExpiry(): LocalDateTime {
        return LocalDateTime.now().plusNanos(accessTokenValidity * 1000000)
    }
    
    fun getRefreshTokenExpiry(): LocalDateTime {
        return LocalDateTime.now().plusNanos(refreshTokenValidity * 1000000)
    }
}
