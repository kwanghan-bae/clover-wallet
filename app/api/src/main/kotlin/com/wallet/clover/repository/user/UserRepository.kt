package com.wallet.clover.repository.user

import com.wallet.clover.entity.user.UserEntity
import org.springframework.data.repository.reactive.ReactiveCrudRepository
import org.springframework.stereotype.Repository
import reactor.core.publisher.Mono

@Repository
interface UserRepository : ReactiveCrudRepository<UserEntity, Long> {
    fun findBySsoQualifier(ssoQualifier: String): Mono<UserEntity>
}
