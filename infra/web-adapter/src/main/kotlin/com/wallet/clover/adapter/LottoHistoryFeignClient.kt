package com.wallet.clover.adapter

import org.springframework.cloud.openfeign.FeignClient
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestParam

@FeignClient(
    name = "lottoFeignClient",
    url = "https://www.dhlottery.co.kr",
    configuration = [LottoFeignClientConfig::class],
)
interface LottoHistoryFeignClient {
    @GetMapping("/common.do")
    fun getByGameNumber(
        @RequestParam(name = "drwNo") gameNumber: Int,
        @RequestParam method: String = "getLottoNumber",
    ): LottoResponse
}
