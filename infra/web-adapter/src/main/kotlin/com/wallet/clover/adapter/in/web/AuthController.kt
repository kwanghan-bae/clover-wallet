package com.wallet.clover.adapter.`in`.web

import com.wallet.clover.common.WebAdapter
import com.wallet.clover.domain.user.User
import com.wallet.clover.port.`in`.user.UserUseCase
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import reactor.core.publisher.Mono

@WebAdapter
@RestController
@RequestMapping("/api/v1/auth")
class AuthController(
    private val userUseCase: UserUseCase
) {

    @PostMapping("/login")
    fun login(@AuthenticationPrincipal jwt: Jwt): Mono<User> {
        val userId = jwt.subject
        val email = jwt.claims["email"] as? String
        // Supabase JWT usually has 'sub' as the user ID (UUID)
        
        return userUseCase.syncUser(userId, email)
    }
}
