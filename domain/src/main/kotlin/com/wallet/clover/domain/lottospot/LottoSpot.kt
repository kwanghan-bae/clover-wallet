package com.wallet.clover.domain.lottospot

import java.time.LocalDateTime

data class LottoSpot(
    val id: Long = 0L,
    val name: String,
    val address: String,
    val latitude: Double,
    val longitude: Double,
    val firstPlaceWins: Int,
    val secondPlaceWins: Int,
    val lastUpdated: LocalDateTime = LocalDateTime.now(),
)
