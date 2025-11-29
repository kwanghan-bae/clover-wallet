package com.wallet.clover.api.service

import com.wallet.clover.api.dto.UpdateUserRequest
import com.wallet.clover.api.dto.UserResponse
import com.wallet.clover.api.dto.toResponse
import com.wallet.clover.api.exception.UserNotFoundException
import com.wallet.clover.api.repository.user.UserRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Transactional(readOnly = true)
class UserService(
    private val userRepository: UserRepository,
) {

    suspend fun findUser(id: Long): UserResponse? {
        return userRepository.findById(id)?.toResponse()
    }

    @Transactional
    suspend fun updateUser(id: Long, request: UpdateUserRequest): UserResponse {
        val existingUser = userRepository.findById(id) ?: throw UserNotFoundException("User with id $id not found")
        val updatedUser = existingUser.copy(
            locale = request.locale ?: existingUser.locale,
            age = request.age ?: existingUser.age
        )
        return userRepository.save(updatedUser).toResponse()
    }
}
