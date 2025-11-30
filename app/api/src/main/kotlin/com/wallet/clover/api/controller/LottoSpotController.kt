package com.wallet.clover.api.controller

import com.wallet.clover.api.dto.LottoSpotResponse
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
    suspend fun getAllLottoSpots(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int
    ): Flow<LottoSpotResponse> {
        return lottoSpotService.getAllLottoSpots(page, size)
    }

    @GetMapping("/search")
    suspend fun searchByName(@RequestParam name: String): List<LottoSpotResponse> {
        return lottoSpotService.searchByName(name)
    }
}
