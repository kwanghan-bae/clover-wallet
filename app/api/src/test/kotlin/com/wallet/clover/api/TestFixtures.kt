package com.wallet.clover.api

import com.wallet.clover.api.entity.user.UserEntity
import java.time.LocalDateTime

object TestFixtures {
    fun createUser(
        id: Long = 1L,
        ssoQualifier: String = "test-sso",
        locale: String = "en",
        age: Int = 30
    ) = UserEntity(
        id = id,
        ssoQualifier = ssoQualifier,
        locale = locale,
        age = age,
        createdAt = LocalDateTime.now().withNano(0),
        updatedAt = LocalDateTime.now().withNano(0)
    )
}
