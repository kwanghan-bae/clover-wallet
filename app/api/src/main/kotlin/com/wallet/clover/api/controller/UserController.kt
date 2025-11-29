package com.wallet.clover.api.controller

import com.wallet.clover.api.entity.user.UserEntity
import com.wallet.clover.api.service.UserService
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/users")
class UserController(
    private val userService: UserService,
) {

    @GetMapping("/{id}")
    suspend fun getUser(@PathVariable id: Long): UserEntity? {
        return userService.findUser(id)
    }

    @PutMapping("/{id}")
    suspend fun updateUser(
        @PathVariable id: Long,
        @RequestBody user: UserEntity
    ): UserEntity {
        return userService.updateUser(id, user)
    }
}
