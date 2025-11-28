package com.wallet.clover.service.user

import com.wallet.clover.common.UseCase
import com.wallet.clover.domain.user.User
import com.wallet.clover.port.`in`.user.UserUseCase
import com.wallet.clover.port.out.user.UserPort
import org.springframework.transaction.annotation.Transactional
import reactor.core.publisher.Mono

@UseCase
@Transactional
class UserService(
    private val userPort: UserPort
) : UserUseCase {

    override fun syncUser(ssoQualifier: String, email: String?): Mono<User> {
        // TODO: We might want to store email as well if we add it to the User model
        return userPort.findBySsoQualifier(ssoQualifier)
            .switchIfEmpty(
                userPort.save(
                    User(
                        ssoQualifier = ssoQualifier,
                        // Default values for new users
                        age = 0, 
                        locale = "ko"
                    )
                )
            )
    }
}
