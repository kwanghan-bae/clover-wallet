package com.lotto.manager.adapter

import org.springframework.cloud.openfeign.FeignClient
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestParam

@FeignClient(
    name = "lottoFeignClient",
    url = "https://www.dhlottery.co.kr",
    configuration = [LottoFeignClientConfig::class]
)
interface LottoHistoryFeignClient {

    @GetMapping("/common.do")
    fun getByGameNumber(
        @RequestParam(name = "drwNo") gameNumber: Int,
        @RequestParam method: String = "getLottoNumber"
    ): LottoResponse
}

// https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=903
// https://m.dhlottery.co.kr/qr.do?method=winQr&v=1054q061011142332q041226293143q141623252628q172332343542q0508142427451553697995
