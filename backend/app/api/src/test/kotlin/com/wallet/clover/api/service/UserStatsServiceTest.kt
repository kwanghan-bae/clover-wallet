package com.wallet.clover.api.service

import com.wallet.clover.api.repository.game.LottoGameRepository
import io.mockk.coEvery
import io.mockk.mockk
import kotlinx.coroutines.test.runTest
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test

class UserStatsServiceTest {

    private val lottoGameRepository: LottoGameRepository = mockk()
    private val userStatsService = UserStatsService(lottoGameRepository)

    @Test
    fun `getUserStats should calculate stats correctly`() = runTest {
        // Given
        val userId = 1L
        val totalGames = 10L
        val totalWinnings = 5000L
        
        coEvery { lottoGameRepository.countByUserId(userId) } returns totalGames
        coEvery { lottoGameRepository.sumPrizeAmountByUserId(userId) } returns totalWinnings

        // When
        val result = userStatsService.getUserStats(userId)

        // Then
        assertEquals(10, result.totalGames)
        assertEquals(5000L, result.totalWinnings)
        assertEquals(10000L, result.totalSpent) // 10 * 1000
        assertEquals(-50, result.roi) // (5000 - 10000) / 10000 * 100 = -50
    }

    @Test
    fun `getUserStats should handle zero games`() = runTest {
        // Given
        val userId = 1L
        
        coEvery { lottoGameRepository.countByUserId(userId) } returns 0L
        coEvery { lottoGameRepository.sumPrizeAmountByUserId(userId) } returns null

        // When
        val result = userStatsService.getUserStats(userId)

        // Then
        assertEquals(0, result.totalGames)
        assertEquals(0L, result.totalWinnings)
        assertEquals(0L, result.totalSpent)
        assertEquals(0, result.roi)
    }
}
