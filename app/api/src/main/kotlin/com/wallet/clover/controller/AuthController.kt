package com.wallet.clover.adapter.`in`.web

import com.wallet.clover.entity.user.UserEntity
import com.wallet.clover.repository.user.UserRepository
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import reactor.core.publisher.Mono
import reactor.core.scheduler.Schedulers


@RestController
@RequestMapping("/api/v1/auth")
class AuthController(
    private val userRepository: UserRepository
) {

    @PostMapping("/login")
    fun login(@AuthenticationPrincipal jwt: Jwt): Mono<UserEntity> {
        val userId = jwt.subject
        val email = jwt.claims["email"] as? String
        
        return Mono.fromCallable {
            userRepository.findBySsoQualifier(userId) ?: userRepository.save(
                UserEntity(
                    ssoQualifier = userId,
                    age = 0,
                    locale = "ko"
                )
            )
        }.subscribeOn(Schedulers.boundedElastic())
    }
}
