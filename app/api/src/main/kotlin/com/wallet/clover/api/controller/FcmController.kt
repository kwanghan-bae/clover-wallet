package com.wallet.clover.api.controller

import com.wallet.clover.api.dto.Fcm
import com.wallet.clover.api.service.FcmService
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/fcm")
class FcmController(
    private val fcmService: FcmService
) {

    @PostMapping("/token")
    suspend fun registerToken(
        @AuthenticationPrincipal jwt: Jwt,
        @RequestBody request: Fcm.RegisterTokenRequest
    ): Fcm.RegisterTokenResponse {
        val ssoQualifier = jwt.subject
        fcmService.registerToken(ssoQualifier, request.token)
        return Fcm.RegisterTokenResponse(true)
    }
}
