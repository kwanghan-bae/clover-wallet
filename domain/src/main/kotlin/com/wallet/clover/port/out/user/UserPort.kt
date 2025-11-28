package com.wallet.clover.port.out.user

import com.wallet.clover.domain.user.User
import reactor.core.publisher.Mono

interface UserPort {
    fun findBySsoQualifier(ssoQualifier: String): Mono<User>
    fun save(user: User): Mono<User>
}
