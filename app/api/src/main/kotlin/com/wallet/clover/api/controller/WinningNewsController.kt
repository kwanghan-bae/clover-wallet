package com.wallet.clover.api.controller

import com.wallet.clover.api.service.WinningNewsService
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/winning-news")
class WinningNewsController(
    private val winningNewsService: WinningNewsService
) {

    @GetMapping("/recent")
    suspend fun getRecentWinningNews(): List<Map<String, Any>> {
        return winningNewsService.getRecentWinningNews()
    }
}
