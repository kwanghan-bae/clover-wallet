package com.wallet.clover.domain.recommendationsource

import java.time.LocalDateTime

data class RecommendationRatio(
    val id: Long,
    val userId: Long,
    val randomWeight: Int = 0,
    val customTextWeight: Int = 0,
    val birthDayWeight: Int = 0,
    val nameWeight: Int = 0,
    val dateWeight: Int = 0,
    val monthWeight: Int = 0,
    val oddAndEvenWeight: Int = 0,
    val sumRangeWeight: Int = 0,
    val previousGameWeight: Int = 0,
    val createdAt: LocalDateTime = LocalDateTime.now(),
    val updatedAt: LocalDateTime = LocalDateTime.now(),
)
