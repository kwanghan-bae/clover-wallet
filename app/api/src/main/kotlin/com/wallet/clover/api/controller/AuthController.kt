package com.wallet.clover.api.controller

import com.wallet.clover.api.common.CommonResponse
import com.wallet.clover.api.service.AuthService
import com.wallet.clover.api.service.LoginResponse
import com.wallet.clover.api.service.RefreshResponse
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/auth")
class AuthController(
    private val authService: AuthService
) {

    @PostMapping("/login")
    suspend fun login(@AuthenticationPrincipal jwt: Jwt): CommonResponse<LoginResponse> {
        val userId = jwt.subject
        val loginResponse = authService.login(userId)
        return CommonResponse.success(loginResponse)
    }
    
    /**
     * Access Token 갱신
     */
    @PostMapping("/refresh")
    suspend fun refresh(@RequestBody request: RefreshRequest): CommonResponse<RefreshResponse> {
        val refreshResponse = authService.refresh(request.refreshToken)
        return CommonResponse.success(refreshResponse)
    }
    
    /**
     * 로그아웃 (토큰 무효화)
     */
    @PostMapping("/logout")
    suspend fun logout(
        @RequestHeader("Authorization") authorization: String,
        @RequestBody request: LogoutRequest
    ): CommonResponse<String> {
        val accessToken = authorization.removePrefix("Bearer ").trim()
        authService.logout(accessToken, request.refreshToken)
        return CommonResponse.success("Logged out successfully")
    }
}

data class RefreshRequest(
    val refreshToken: String
)

data class LogoutRequest(
    val refreshToken: String
)
