package com.lotto.manager.adapter

import org.springframework.cloud.openfeign.FeignClient
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestParam

@FeignClient(name = "lottoFeignClient", url = "https://www.dhlottery.co.kr", configuration = [LottoFeignClientConfig::class])
interface LottoFeignClient {

    @GetMapping("/common.do")
    fun getByGameNumber(
        @RequestParam(name = "drwNo") gameNumber: Int,
        @RequestParam method: String = "getLottoNumber"
    ): LottoResponse
}

// https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=903