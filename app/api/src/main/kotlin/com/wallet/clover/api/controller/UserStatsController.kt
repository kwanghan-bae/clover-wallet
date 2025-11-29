package com.wallet.clover.api.controller

import com.wallet.clover.api.dto.UserStatsResponse
import com.wallet.clover.api.service.UserStatsService
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/users")
class UserStatsController(
    private val userStatsService: UserStatsService
) {

    @GetMapping("/{userId}/stats")
    suspend fun getUserStats(@PathVariable userId: Long): UserStatsResponse {
        return userStatsService.getUserStats(userId)
    }
}
