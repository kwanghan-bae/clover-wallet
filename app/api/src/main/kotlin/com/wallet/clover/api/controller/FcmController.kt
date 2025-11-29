package com.wallet.clover.api.controller

import com.wallet.clover.api.repository.user.UserRepository
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/fcm")
class FcmController(
    private val userRepository: UserRepository
) {

    data class RegisterTokenRequest(val token: String)
    data class RegisterTokenResponse(val success: Boolean)

    @PostMapping("/token")
    suspend fun registerToken(
        @AuthenticationPrincipal jwt: Jwt,
        @RequestBody request: RegisterTokenRequest
    ): RegisterTokenResponse {
        val userId = jwt.subject
        val user = userRepository.findBySsoQualifier(userId)
            ?: return RegisterTokenResponse(false)

        userRepository.save(user.copy(fcmToken = request.token))
        return RegisterTokenResponse(true)
    }
}
