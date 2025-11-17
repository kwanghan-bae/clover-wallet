package com.wallet.clover.api.application

import com.wallet.clover.domain.lottospot.LottoSpot
import com.wallet.clover.domain.lottospot.LottoSpotRepository
import org.springframework.stereotype.Service

@Service
class LottoSpotService(
    private val lottoSpotRepository: LottoSpotRepository,
) {
    fun getAllLottoSpots(): List<LottoSpot> {
        return lottoSpotRepository.findAll()
    }

    fun getLottoSpotsNearLocation(latitude: Double, longitude: Double, radiusKm: Double): List<LottoSpot> {
        return lottoSpotRepository.findByLocation(latitude, longitude, radiusKm)
    }

    // Add other business logic methods as needed
}
