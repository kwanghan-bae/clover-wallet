package com.wallet.clover.port.`in`.user

import com.wallet.clover.domain.user.User
import reactor.core.publisher.Mono

interface UserUseCase {
    fun syncUser(ssoQualifier: String, email: String?): Mono<User>
}
