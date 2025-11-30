package com.wallet.clover.api.controller

import com.wallet.clover.api.service.WinningCheckService
import com.wallet.clover.api.service.WinningInfoCrawler
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/lotto")
class LottoTestController(
    private val winningCheckService: WinningCheckService,
    private val winningInfoCrawler: WinningInfoCrawler
) {

    @GetMapping("/test-scheduler")
    suspend fun triggerSchedulerManual(@RequestParam(required = false) round: Int?): String {
        val targetRound = round ?: 1100 // Default or calculate current
        winningInfoCrawler.crawlWinningInfo(targetRound)
        winningCheckService.checkWinning(targetRound)
        return "Scheduler triggered successfully for round $targetRound! Check server logs for details."
    }
}
