package com.wallet.clover.api.controller

import com.wallet.clover.api.dto.Login
import com.wallet.clover.api.service.AuthService
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/auth")
class AuthController(
    private val authService: AuthService
) {

    @PostMapping("/login")
    suspend fun login(@AuthenticationPrincipal jwt: Jwt): Login.Response {
        val userId = jwt.subject
        val user = authService.login(userId)
        
        return Login.Response(
            userId = user.id!!,
            ssoQualifier = user.ssoQualifier,
            locale = user.locale
        )
    }
}
