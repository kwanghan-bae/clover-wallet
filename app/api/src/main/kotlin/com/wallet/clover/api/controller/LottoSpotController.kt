package com.wallet.clover.api.controller

import com.wallet.clover.api.entity.lottospot.LottoSpotEntity
import com.wallet.clover.api.service.LottoSpotService
import kotlinx.coroutines.flow.Flow
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/lotto-spots")
class LottoSpotController(
    private val lottoSpotService: LottoSpotService,
) {

    @GetMapping
    suspend fun getAllLottoSpots(): Flow<LottoSpotEntity> {
        return lottoSpotService.getAllLottoSpots()
    }

    @GetMapping("/search")
    suspend fun searchByName(@RequestParam name: String): List<LottoSpotEntity> {
        return lottoSpotService.searchByName(name)
    }
}
