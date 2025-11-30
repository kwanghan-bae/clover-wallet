package com.wallet.clover.api.controller

import com.wallet.clover.api.common.CommonResponse
import com.wallet.clover.api.entity.lottospot.LottoWinningStoreEntity
import com.wallet.clover.api.repository.lottospot.LottoWinningStoreRepository
import com.wallet.clover.api.service.LottoWinningStoreCrawler
import kotlinx.coroutines.flow.toList
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/lotto-spots")
class LottoWinningStoreController(
    private val crawler: LottoWinningStoreCrawler,
    private val repository: LottoWinningStoreRepository
) {

    @PostMapping("/crawl/{round}")
    suspend fun crawlStores(@PathVariable round: Int): CommonResponse<String> {
        crawler.crawlWinningStores(round)
        return CommonResponse.success("Crawling started for round $round")
    }

    @GetMapping("/winning/{round}")
    suspend fun getWinningStores(@PathVariable round: Int): CommonResponse<List<LottoWinningStoreEntity>> {
        val stores = repository.findByRound(round)
        return CommonResponse.success(stores)
    }
}
