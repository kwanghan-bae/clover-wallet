package com.wallet.clover.api.endpoint.impl

import com.wallet.clover.api.application.LottoSpotService
import com.wallet.clover.domain.lottospot.LottoSpot
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/v1/lotto-spots")
class LottoSpotController(
    private val lottoSpotService: LottoSpotService,
) {

    @GetMapping
    fun getAllLottoSpots(): List<LottoSpot> {
        return lottoSpotService.getAllLottoSpots()
    }

    @GetMapping("/near-location")
    fun getLottoSpotsNearLocation(
        @RequestParam latitude: Double,
        @RequestParam longitude: Double,
        @RequestParam(defaultValue = "10.0") radiusKm: Double, // Default radius of 10 km
    ): List<LottoSpot> {
        return lottoSpotService.getLottoSpotsNearLocation(latitude, longitude, radiusKm)
    }
}
