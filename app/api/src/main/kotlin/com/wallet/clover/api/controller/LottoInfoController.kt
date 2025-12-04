package com.wallet.clover.api.controller

import com.wallet.clover.api.common.CommonResponse
import com.wallet.clover.api.service.LottoInfoService
import com.wallet.clover.api.service.WinningNewsService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/lotto-info")
class LottoInfoController(
    private val lottoInfoService: LottoInfoService,
    private val winningNewsService: WinningNewsService
) {

    @GetMapping("/next-draw")
    suspend fun getNextDrawInfo(): CommonResponse<Map<String, Any>> {
        return CommonResponse.success(lottoInfoService.getNextDrawInfo())
    }

    @GetMapping("/news/recent")
    suspend fun getRecentWinningNews(): List<Map<String, Any>> {
        return winningNewsService.getRecentWinningNews()
    }

    @GetMapping("/draw-result")
    suspend fun getDrawResult(@RequestParam round: Int): CommonResponse<com.wallet.clover.api.entity.winning.WinningInfoEntity?> {
        return CommonResponse.success(lottoInfoService.getDrawResult(round))
    }
}
