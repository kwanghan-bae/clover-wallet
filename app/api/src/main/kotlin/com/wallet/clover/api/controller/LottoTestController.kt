package com.wallet.clover.api.controller

import com.wallet.clover.api.service.LottoWinningService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/lotto")
class LottoTestController(
    private val lottoWinningService: LottoWinningService
) {

    @GetMapping("/test-scheduler")
    suspend fun triggerSchedulerManual(): String {
        lottoWinningService.checkWinningManually()
        return "Scheduler triggered successfully! Check server logs for details."
    }
}
