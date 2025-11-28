package com.wallet.clover.repository.user

import com.wallet.clover.common.PersistenceAdapter
import com.wallet.clover.domain.user.User
import com.wallet.clover.entity.user.toDomain
import com.wallet.clover.entity.user.toEntity
import com.wallet.clover.port.out.user.UserPort
import org.springframework.stereotype.Component
import reactor.core.publisher.Mono
import reactor.core.scheduler.Schedulers

@PersistenceAdapter
@Component
class UserPersistenceAdapter(
    private val userRepository: UserRepository
) : UserPort {

    override fun findBySsoQualifier(ssoQualifier: String): Mono<User> {
        return Mono.fromCallable {
            userRepository.findBySsoQualifier(ssoQualifier)?.toDomain()
        }
        .flatMap { Mono.justOrEmpty(it) }
        .subscribeOn(Schedulers.boundedElastic())
    }

    override fun save(user: User): Mono<User> {
        return Mono.fromCallable {
            userRepository.save(user.toEntity()).toDomain()
        }
        .subscribeOn(Schedulers.boundedElastic())
    }
}
