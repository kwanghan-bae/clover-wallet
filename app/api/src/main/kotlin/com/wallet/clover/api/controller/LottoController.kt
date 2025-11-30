package com.wallet.clover.api.controller

import com.wallet.clover.api.dto.LottoGameResponse
import com.wallet.clover.api.entity.game.LottoGameEntity
import com.wallet.clover.api.service.LottoGameService
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/lotto")
class LottoController(
    private val lottoGameService: LottoGameService,
) {

    @GetMapping("/games")
    suspend fun getMyGames(
        @RequestParam userId: Long,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int
    ): List<LottoGameResponse> {
        return lottoGameService.getGamesByUserId(userId, page, size).map { LottoGameResponse.from(it) }
    }

    @PostMapping("/games")
    suspend fun saveGame(@RequestBody request: com.wallet.clover.api.dto.LottoGameRequest): LottoGameResponse {
        return LottoGameResponse.from(lottoGameService.saveGame(request.toEntity()))
    }
}
