package com.wallet.clover.api.controller

import com.wallet.clover.api.entity.game.LottoGameEntity
import com.wallet.clover.api.service.LottoGameService
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/lotto")
class LottoController(
    private val lottoGameService: LottoGameService,
) {

    @GetMapping("/games")
    suspend fun getMyGames(@RequestParam userId: Long): List<LottoGameEntity> {
        return lottoGameService.getGamesByUserId(userId)
    }

    @PostMapping("/games")
    suspend fun saveGame(@RequestBody game: LottoGameEntity): LottoGameEntity {
        return lottoGameService.saveGame(game)
    }
}
