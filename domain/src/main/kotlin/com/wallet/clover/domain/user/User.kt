package com.wallet.clover.domain.user

import java.time.LocalDateTime

data class User(
    val id: Long = 0,
    val ssoQualifier: String? = null,
    val locale: String? = null,
    val age: Int? = null,
    val createdAt: LocalDateTime = LocalDateTime.now(),
    val updatedAt: LocalDateTime = LocalDateTime.now(),
)
