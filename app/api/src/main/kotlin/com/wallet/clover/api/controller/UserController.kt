package com.wallet.clover.api.controller

import com.wallet.clover.api.dto.UpdateUser
import com.wallet.clover.api.dto.User
import com.wallet.clover.api.service.UserService
import jakarta.validation.Valid
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/users")
class UserController(
    private val userService: UserService,
) {

    @GetMapping("/{id}")
    suspend fun getUser(@PathVariable id: Long): User.Response? {
        return userService.findUser(id)
    }

    @PutMapping("/{id}")
    suspend fun updateUser(
        @PathVariable id: Long,
        @Valid @RequestBody request: UpdateUser.Request
    ): User.Response {
        return userService.updateUser(id, request)
    }
}
