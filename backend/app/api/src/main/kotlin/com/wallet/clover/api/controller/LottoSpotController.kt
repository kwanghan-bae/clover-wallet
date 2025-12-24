package com.wallet.clover.api.controller

import com.wallet.clover.api.common.CommonResponse
import com.wallet.clover.api.common.PageResponse
import com.wallet.clover.api.dto.LottoSpot
import com.wallet.clover.api.dto.LottoWinningStore
import com.wallet.clover.api.service.LottoSpotService
import com.wallet.clover.api.service.LottoWinningStoreService
import kotlinx.coroutines.flow.Flow
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/lotto-spots")
class LottoSpotController(
    private val lottoSpotService: LottoSpotService,
    private val lottoWinningStoreService: LottoWinningStoreService
) {

    @GetMapping
    suspend fun getAllLottoSpots(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int
    ): CommonResponse<PageResponse<LottoSpot.Response>> {
        return CommonResponse.success(lottoSpotService.getAllLottoSpots(page, size))
    }

    @GetMapping("/search")
    suspend fun searchByName(@RequestParam name: String): CommonResponse<List<LottoSpot.Response>> {
        return CommonResponse.success(lottoSpotService.searchByName(name))
    }

    @PostMapping("/crawl/{round}")
    suspend fun crawlStores(@PathVariable round: Int): CommonResponse<String> {
        lottoWinningStoreService.crawlWinningStores(round)
        return CommonResponse.success("Crawling started for round ")
    }

    @GetMapping("/winning/{round}")
    suspend fun getWinningStores(@PathVariable round: Int): CommonResponse<List<LottoWinningStore.Response>> {
        val stores = lottoWinningStoreService.getWinningStores(round)
        return CommonResponse.success(stores.map { LottoWinningStore.Response.from(it) })
    }

    @GetMapping("/{spotId}/history")
    suspend fun getSpotWinningHistory(@PathVariable spotId: Long): CommonResponse<List<LottoWinningStore.Response>> {
        val spot = lottoSpotService.getSpotById(spotId)
        val history = lottoWinningStoreService.getWinningHistoryByName(spot.name)
        return CommonResponse.success(history.map { LottoWinningStore.Response.from(it) })
    }
}
