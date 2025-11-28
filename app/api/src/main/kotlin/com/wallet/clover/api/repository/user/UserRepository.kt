package com.wallet.clover.api.repository.user

import com.wallet.clover.api.entity.user.UserEntity
import org.springframework.data.repository.kotlin.CoroutineCrudRepository
import org.springframework.stereotype.Repository

@Repository
interface UserRepository : CoroutineCrudRepository<UserEntity, Long> {
    suspend fun findBySsoQualifier(ssoQualifier: String): UserEntity?
}
