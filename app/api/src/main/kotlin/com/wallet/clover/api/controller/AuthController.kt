package com.wallet.clover.api.controller

import com.wallet.clover.api.common.CommonResponse
import com.wallet.clover.api.dto.Auth
import com.wallet.clover.api.service.AuthService
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/auth")
class AuthController(
    private val authService: AuthService
) {

    @PostMapping("/login")
    suspend fun login(@AuthenticationPrincipal jwt: Jwt): CommonResponse<Auth.LoginResponse> {
        val userId = jwt.subject
        val loginResponse = authService.login(userId)
        return CommonResponse.success(loginResponse)
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
