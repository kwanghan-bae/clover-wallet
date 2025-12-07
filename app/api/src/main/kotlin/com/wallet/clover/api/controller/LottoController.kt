package com.wallet.clover.api.controller

import com.wallet.clover.api.common.CommonResponse
import com.wallet.clover.api.dto.ExtractNumbers
import com.wallet.clover.api.dto.LottoGame
import com.wallet.clover.api.common.PageResponse
import com.wallet.clover.api.dto.SaveGeneratedGameRequest
import com.wallet.clover.api.entity.game.LottoGameEntity
import com.wallet.clover.api.service.ExtractionService
import com.wallet.clover.api.service.LottoGameService
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/lotto")
class LottoController(
    private val lottoGameService: LottoGameService,
    private val extractionService: ExtractionService
) {

    @GetMapping("/games")
    suspend fun getMyGames(
        @RequestParam userId: Long,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int
    ): CommonResponse<PageResponse<LottoGame.Response>> {
        val gamesPage = lottoGameService.getGamesByUserId(userId, page, size)
        val responsePage = PageResponse(
            content = gamesPage.content.map { LottoGame.Response.from(it) },
            page = gamesPage.page,
            size = gamesPage.size,
            totalElements = gamesPage.totalElements,
            totalPages = gamesPage.totalPages
        )
        return CommonResponse.success(responsePage)
    }

    @PostMapping("/games")
    suspend fun saveGame(@RequestBody request: SaveGeneratedGameRequest): CommonResponse<LottoGame.Response> {
        val savedGame = lottoGameService.saveGeneratedGame(request)
        return CommonResponse.success(LottoGame.Response.from(savedGame))
    }

    @PostMapping("/extraction")
    suspend fun extractNumbers(@RequestBody request: ExtractNumbers.Request): CommonResponse<Set<Int>> {
        return CommonResponse.success(extractionService.extractLottoNumbers(request))
    }
}
