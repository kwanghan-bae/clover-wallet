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
        val targetRound = round ?: 1100 // 기본값 또는 현재 회차 계산
        winningInfoCrawler.crawlWinningInfo(targetRound)
        winningCheckService.checkWinning(targetRound)
        return "$targetRound 회차 스케줄러가 수동으로 실행되었습니다! 자세한 내용은 서버 로그를 확인하세요."
    }
}
