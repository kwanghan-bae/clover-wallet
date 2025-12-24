package com.wallet.clover.api.controller

import com.wallet.clover.api.common.CommonResponse
import com.wallet.clover.api.service.DataInitializationService
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.launch

@RestController
@RequestMapping("/api/v1/admin")
class AdminController(
    private val dataInitializationService: DataInitializationService
) {

    @PostMapping("/init/history")
    suspend fun initHistory(
        @RequestParam(required = false, defaultValue = "1") start: Int,
        @RequestParam(required = false) end: Int?
    ): CommonResponse<String> {
        // Run in background to avoid timeout
        GlobalScope.launch {
            dataInitializationService.initializeWinningInfo(start, end)
        }
        return CommonResponse.success("History initialization started in background")
    }

    @PostMapping("/init/spots")
    suspend fun initSpots(
        @RequestParam(required = false, defaultValue = "1") start: Int,
        @RequestParam(required = false) end: Int?
    ): CommonResponse<String> {
        // Run in background
        GlobalScope.launch {
            dataInitializationService.initializeWinningStores(start, end)
        }
        return CommonResponse.success("Store initialization started in background")
    }
}
