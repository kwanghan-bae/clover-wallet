package com.wallet.clover.api.service

import org.springframework.stereotype.Service
import java.time.LocalDateTime
import java.util.*

@Service
class JwtService {
    
    // TODO: JWT 라이브러리 추가 (io.jsonwebtoken:jjwt-api)
    // TODO: application.yml에 jwt.secret 설정
    
    private val SECRET_KEY = "CHANGE_THIS_TO_ENV_VARIABLE" // TODO: 환경변수로 변경
    private val ACCESS_TOKEN_VALIDITY = 15 * 60 * 1000L // 15분
    private val REFRESH_TOKEN_VALIDITY = 7 * 24 * 60 * 60 * 1000L // 7일
    
    /**
     * Access Token 생성
     * TODO: JWT 라이브러리를 사용한 실제 구현 필요
     */
    fun generateAccessToken(userId: Long): String {
        // TODO: 실제 JWT 생성 로직
        // Jwts.builder()
        //     .setSubject(userId.toString())
        //     .setExpiration(Date(System.currentTimeMillis() + ACCESS_TOKEN_VALIDITY))
        //     .signWith(Keys.hmacShaKeyFor(SECRET_KEY.toByteArray()))
        //     .compact()
        
        return "access_token_${userId}_${System.currentTimeMillis()}"
    }
    
    /**
     * Refresh Token 생성
     * TODO: JWT 라이브러리를 사용한 실제 구현 필요
     */
    fun generateRefreshToken(userId: Long): String {
        // TODO: 실제 JWT 생성 로직
        return "refresh_token_${userId}_${UUID.randomUUID()}"
    }
    
    /**
     * Access Token 검증 및 userId 추출
     * TODO: JWT 라이브러리를 사용한 실제 구현 필요
     */
    fun validateAccessToken(token: String): Long {
        // TODO: 실제 JWT 검증 로직
        // val claims = Jwts.parserBuilder()
        //     .setSigningKey(Keys.hmacShaKeyFor(SECRET_KEY.toByteArray()))
        //     .build()
        //     .parseClaimsJws(token)
        //     .body
        // return claims.subject.toLong()
        
        // 임시 처리
        return token.split("_").getOrNull(2)?.toLongOrNull() ?: throw IllegalArgumentException("Invalid token")
    }
    
    /**
     * Refresh Token 검증 및 userId 추출
     */
    fun validateRefreshToken(token: String): Long {
        // TODO: 실제 JWT 검증 로직
        return token.split("_").getOrNull(2)?.toLongOrNull() ?: throw IllegalArgumentException("Invalid token")
    }
    
    /**
     * Token 만료 시간 계산
     */
    fun getAccessTokenExpiry(): LocalDateTime {
        return LocalDateTime.now().plusMinutes(15)
    }
    
    fun getRefreshTokenExpiry(): LocalDateTime {
        return LocalDateTime.now().plusDays(7)
    }
}
