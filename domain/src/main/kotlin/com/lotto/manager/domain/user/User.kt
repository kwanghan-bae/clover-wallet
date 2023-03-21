package com.lotto.manager.domain.user

import java.time.LocalDateTime

data class User(
    val sequence: Long,
    val ssoQualifier: String,
    val regionBand: String,
    val ageBand: String,
    val createdAt: LocalDateTime = LocalDateTime.now(),
    val updatedAt: LocalDateTime = LocalDateTime.now()
)
