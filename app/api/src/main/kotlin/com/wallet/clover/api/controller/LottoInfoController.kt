package com.wallet.clover.api.controller

import com.wallet.clover.api.common.CommonResponse
import com.wallet.clover.api.service.LottoInfoService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/lotto-info")
class LottoInfoController(
    private val lottoInfoService: LottoInfoService
) {

    @GetMapping("/next-draw")
    suspend fun getNextDrawInfo(): CommonResponse<Map<String, Any>> {
        return CommonResponse.success(lottoInfoService.getNextDrawInfo())
    }
}
