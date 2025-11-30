package com.wallet.clover.api.controller

import com.wallet.clover.api.common.CommonResponse
import com.wallet.clover.api.service.WinningCheckService
import com.wallet.clover.api.service.WinningInfoCrawler
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/winning")
class WinningInfoController(
    private val crawler: WinningInfoCrawler,
    private val checkService: WinningCheckService
) {

    @PostMapping("/crawl/{round}")
    suspend fun crawlWinningInfo(@PathVariable round: Int): CommonResponse<String> {
        crawler.crawlWinningInfo(round)
        return CommonResponse.success("Winning info crawling started for round $round")
    }

    @PostMapping("/check/{round}")
    suspend fun checkWinning(@PathVariable round: Int): CommonResponse<String> {
        checkService.checkWinning(round)
        return CommonResponse.success("Winning check started for round $round")
    }
}
