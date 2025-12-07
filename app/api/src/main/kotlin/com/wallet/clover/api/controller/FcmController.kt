package com.wallet.clover.api.controller

import com.wallet.clover.api.common.CommonResponse
import com.wallet.clover.api.dto.RegisterToken
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
        @RequestBody request: RegisterToken.Request
    ): CommonResponse<RegisterToken.Response> {
        val ssoQualifier = jwt.subject
        fcmService.registerToken(ssoQualifier, request.token)
        return CommonResponse.success(RegisterToken.Response(true))
    }
}
