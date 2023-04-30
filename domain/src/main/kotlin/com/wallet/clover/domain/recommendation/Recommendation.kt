package com.wallet.clover.domain.recommendation

import java.time.LocalDateTime

data class Recommendation(
    val id: Long,
    val userId: Long,
    val number1: Int,
    val number2: Int,
    val number3: Int,
    val number4: Int,
    val number5: Int,
    val number6: Int,
    val createdAt: LocalDateTime = LocalDateTime.now(),
    val updatedAt: LocalDateTime = LocalDateTime.now(),
)
