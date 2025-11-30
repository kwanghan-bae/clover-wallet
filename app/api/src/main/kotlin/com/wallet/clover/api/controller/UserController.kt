package com.wallet.clover.api.controller

import com.wallet.clover.api.common.CommonResponse
import com.wallet.clover.api.dto.UpdateUser
import com.wallet.clover.api.dto.User
import com.wallet.clover.api.dto.UserStats
import com.wallet.clover.api.service.UserService
import com.wallet.clover.api.service.UserStatsService
import jakarta.validation.Valid
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/users")
class UserController(
    private val userService: UserService,
    private val userStatsService: UserStatsService
) {

    @GetMapping("/{id}")
    suspend fun getUser(@PathVariable id: Long): User.Response {
        return userService.findUser(id) ?: throw com.wallet.clover.api.exception.UserNotFoundException("User not found with id: $id")
    }

    @PutMapping("/{id}")
    suspend fun updateUser(
        @PathVariable id: Long,
        @Valid @RequestBody request: UpdateUser.Request
    ): User.Response {
        return userService.updateUser(id, request)
    }

    @DeleteMapping("/me")
    suspend fun deleteAccount(@AuthenticationPrincipal jwt: Jwt): CommonResponse<String> {
        val userId = jwt.subject.toLong()
        userService.deleteUserAccount(userId)
        return CommonResponse.success("회원 탈퇴가 완료되었습니다")
    }

    @GetMapping("/{userId}/stats")
    suspend fun getUserStats(@PathVariable userId: Long): UserStats.Response {
        return userStatsService.getUserStats(userId)
    }
}
