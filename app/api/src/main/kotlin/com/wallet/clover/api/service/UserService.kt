package com.wallet.clover.api.service

import com.wallet.clover.api.entity.user.UserEntity
import com.wallet.clover.api.repository.user.UserRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Transactional(readOnly = true)
class UserService(
    private val userRepository: UserRepository,
) {

    suspend fun findUser(id: Long): UserEntity? {
        return userRepository.findById(id)
    }

    @Transactional
    suspend fun updateUser(id: Long, user: UserEntity): UserEntity {
        return userRepository.save(user.copy(id = id))
    }
}
