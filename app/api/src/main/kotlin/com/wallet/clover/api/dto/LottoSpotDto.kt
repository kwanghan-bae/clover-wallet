package com.wallet.clover.api.dto

import com.wallet.clover.api.entity.lottospot.LottoSpotEntity

data class LottoSpotResponse(
    val id: Long,
    val name: String,
    val address: String,
    val latitude: Double,
    val longitude: Double
)

fun LottoSpotEntity.toResponse() = LottoSpotResponse(
    id = this.id ?: throw IllegalStateException("LottoSpot ID must not be null"),
    name = this.name,
    address = this.address,
    latitude = this.latitude,
    longitude = this.longitude
)
