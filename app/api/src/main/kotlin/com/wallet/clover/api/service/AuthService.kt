package com.wallet.clover.api.service

import com.wallet.clover.api.common.UserDefaults
import com.wallet.clover.api.entity.user.UserEntity
import com.wallet.clover.api.repository.user.UserRepository
import org.springframework.stereotype.Service

@Service
class AuthService(
    private val userRepository: UserRepository
) {
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
