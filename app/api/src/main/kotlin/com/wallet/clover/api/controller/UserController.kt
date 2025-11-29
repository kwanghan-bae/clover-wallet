package com.wallet.clover.api.controller

import com.wallet.clover.api.dto.UpdateUserRequest
import com.wallet.clover.api.dto.UserResponse
import com.wallet.clover.api.service.UserService
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/users")
class UserController(
    private val userService: UserService,
) {

    @GetMapping("/{id}")
    suspend fun getUser(@PathVariable id: Long): UserResponse? {
        return userService.findUser(id)
    }

    @PutMapping("/{id}")
    suspend fun updateUser(
        @PathVariable id: Long,
        @RequestBody request: UpdateUserRequest
    ): UserResponse {
        return userService.updateUser(id, request)
    }
}
