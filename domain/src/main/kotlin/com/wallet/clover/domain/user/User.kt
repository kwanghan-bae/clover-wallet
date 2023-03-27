package com.wallet.clover.domain.user

import java.time.LocalDateTime

data class User(
    val id: Long = 0,
    val ssoQualifier: String,
    val regionBand: String,
    val ageBand: String,
    val createdAt: LocalDateTime = LocalDateTime.now(),
    val updatedAt: LocalDateTime = LocalDateTime.now(),
)
