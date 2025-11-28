package com.wallet.clover.api.controller

import com.wallet.clover.api.entity.user.UserEntity
import com.wallet.clover.api.repository.user.UserRepository
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/users")
class UserController(
    private val userRepository: UserRepository,
) {

    @GetMapping("/{id}")
    suspend fun getUser(@PathVariable id: Long): UserEntity? {
        return userRepository.findById(id)
    }

    @PutMapping("/{id}")
    suspend fun updateUser(
        @PathVariable id: Long,
        @RequestBody user: UserEntity
    ): UserEntity {
        return userRepository.save(user.copy(id = id))
    }
}
