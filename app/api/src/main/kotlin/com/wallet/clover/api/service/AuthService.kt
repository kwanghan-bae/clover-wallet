package com.wallet.clover.api.service

import com.wallet.clover.api.common.UserDefaults
import com.wallet.clover.api.entity.user.UserEntity
import com.wallet.clover.api.repository.user.UserRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class AuthService(
    private val userRepository: UserRepository
) {
    @Transactional
    suspend fun login(ssoQualifier: String): UserEntity {
        return userRepository.findBySsoQualifier(ssoQualifier)
            ?: userRepository.save(
                UserEntity(
                    ssoQualifier = ssoQualifier,
                    age = UserDefaults.DEFAULT_AGE,
                    locale = UserDefaults.DEFAULT_LOCALE
                )
            )
    }
}
