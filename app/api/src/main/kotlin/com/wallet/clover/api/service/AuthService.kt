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
    // TODO: JWT 토큰 생성 및 검증 로직 구현 필요
    // TODO: 리프레시 토큰 저장 및 갱신 메커니즘 구현 필요
    // TODO: 로그아웃 처리 (토큰 블랙리스트 등) 구현 필요

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
