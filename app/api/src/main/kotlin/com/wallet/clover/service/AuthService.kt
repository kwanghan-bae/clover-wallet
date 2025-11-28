package com.wallet.clover.service

import com.wallet.clover.common.UserDefaults
import com.wallet.clover.entity.user.UserEntity
import com.wallet.clover.repository.user.UserRepository
import org.springframework.stereotype.Service
import reactor.core.publisher.Mono

@Service
class AuthService(
    private val userRepository: UserRepository
) {
    fun login(ssoQualifier: String): Mono<UserEntity> {
        return userRepository.findBySsoQualifier(ssoQualifier)
            .switchIfEmpty(
                userRepository.save(
                    UserEntity(
                        ssoQualifier = ssoQualifier,
                        age = UserDefaults.DEFAULT_AGE,
                        locale = UserDefaults.DEFAULT_LOCALE
                    )
                )
            )
    }
}
