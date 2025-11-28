package com.wallet.clover.controller

import com.wallet.clover.dto.LoginResponse
import com.wallet.clover.service.AuthService
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import reactor.core.publisher.Mono


@RestController
@RequestMapping("/api/v1/auth")
class AuthController(
    private val authService: AuthService
) {

    @PostMapping("/login")
    fun login(@AuthenticationPrincipal jwt: Jwt): Mono<LoginResponse> {
        val userId = jwt.subject
        
        return authService.login(userId)
            .map { user ->
                LoginResponse(
                    userId = user.id!!,
                    ssoQualifier = user.ssoQualifier,
                    locale = user.locale
                )
            }
    }
}
