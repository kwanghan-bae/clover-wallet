package com.wallet.clover.api.endpoint.impl

import com.wallet.clover.api.application.LottoService
import com.wallet.clover.api.endpoint.LottoCheck
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RequestMapping("/v1/lotto")
@RestController
class LottoController(
    private val lottoService: LottoService,
) {

    @GetMapping("/check-winnings")
    fun checkWinnings(@RequestParam userId: Long): LottoCheck.Out {
        return lottoService.checkWinnings(userId)
    }
}
