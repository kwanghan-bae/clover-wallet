package com.wallet.clover.api.dto

import com.wallet.clover.api.entity.lottospot.LottoSpotEntity

abstract class LottoSpot {
    data class Response(
        /** 판매점 ID */
        val id: Long,
        /** 판매점 이름 */
        val name: String,
        /** 주소 */
        val address: String,
        /** 위도 */
        val latitude: Double,
        /** 경도 */
        val longitude: Double,
        /** 1등 당첨 횟수 */
        val firstPlaceWins: Int,
        /** 2등 당첨 횟수 */
        val secondPlaceWins: Int
    )
}

fun LottoSpotEntity.toResponse() = LottoSpot.Response(
    id = this.id ?: throw IllegalStateException("LottoSpot ID must not be null"),
    name = this.name,
    address = this.address,
    latitude = this.latitude,
    longitude = this.longitude,
    firstPlaceWins = this.firstPlaceWins,
    secondPlaceWins = this.secondPlaceWins
)
