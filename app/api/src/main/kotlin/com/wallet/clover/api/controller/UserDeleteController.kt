package com.wallet.clover.api.controller

import com.wallet.clover.api.common.CommonResponse
import com.wallet.clover.api.service.UserService
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/users")
class UserDeleteController(
    private val userService: UserService
) {

    @DeleteMapping("/me")
    suspend fun deleteAccount(@AuthenticationPrincipal jwt: Jwt): CommonResponse<String> {
        val userId = jwt.subject.toLong()
        userService.deleteUserAccount(userId)
        return CommonResponse.success("회원 탈퇴가 완료되었습니다")
    }
}
