package com.wallet.clover.api.controller

import com.wallet.clover.api.common.CommonResponse
import com.wallet.clover.api.entity.lottospot.LottoWinningStoreEntity
import com.wallet.clover.api.service.LottoWinningStoreService
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/lotto-spots")
class LottoWinningStoreController(
    private val service: LottoWinningStoreService
) {

    @PostMapping("/crawl/{round}")
    suspend fun crawlStores(@PathVariable round: Int): CommonResponse<String> {
        service.crawlWinningStores(round)
        return CommonResponse.success("Crawling started for round $round")
    }

    @GetMapping("/winning/{round}")
    suspend fun getWinningStores(@PathVariable round: Int): CommonResponse<List<LottoWinningStoreEntity>> {
        val stores = service.getWinningStores(round)
        return CommonResponse.success(stores)
    }
}
