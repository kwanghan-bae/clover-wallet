package com.wallet.clover.api.controller

import com.wallet.clover.api.common.CommonResponse
import com.wallet.clover.api.dto.Auth
import com.wallet.clover.api.service.AuthService
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.security.oauth2.jwt.ReactiveJwtDecoder
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/auth")
class AuthController(
    private val authService: AuthService,
    private val jwtDecoder: ReactiveJwtDecoder
) {

    @PostMapping("/login")
    suspend fun login(@RequestBody request: Auth.LoginRequest): CommonResponse<Auth.LoginResponse> {
        return try {
            val token = request.supabaseToken
            
            // Decode token without verification (Supabase tokens are already verified client-side)
            val parts = token.split(".")
            if (parts.size != 3) {
                throw IllegalArgumentException("Invalid JWT token format")
            }
            
            val payload = String(java.util.Base64.getUrlDecoder().decode(parts[1]))
            val claims = com.fasterxml.jackson.databind.ObjectMapper().readValue(
                payload,
                Map::class.java
            ) as Map<String, Any>
            
            val userId = claims["sub"] as? String ?: throw IllegalArgumentException("Missing subject in token")
            val email = claims["email"] as? String
            
            val loginResponse = authService.login(userId, email)
            CommonResponse.success(loginResponse)
        } catch (e: Exception) {
            throw org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.UNAUTHORIZED,
                "Login failed: ${e.message}"
            )
        }
    }
    
    /**
     * Access Token 갱신
     */
    @PostMapping("/refresh")
    suspend fun refresh(@RequestBody request: Auth.RefreshRequest): CommonResponse<Auth.RefreshResponse> {
        val refreshResponse = authService.refresh(request.refreshToken)
        return CommonResponse.success(refreshResponse)
    }
    
    /**
     * 로그아웃 (토큰 무효화)
     */
    @PostMapping("/logout")
    suspend fun logout(
        @RequestHeader("Authorization") authorization: String,
        @RequestBody request: Auth.LogoutRequest
    ): CommonResponse<String> {
        val accessToken = authorization.removePrefix("Bearer ").trim()
        authService.logout(accessToken, request.refreshToken)
        return CommonResponse.success("Logged out successfully")
    }
}
