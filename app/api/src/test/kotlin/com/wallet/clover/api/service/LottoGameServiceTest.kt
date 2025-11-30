package com.wallet.clover.api.service

import com.wallet.clover.api.TestFixtures
import com.wallet.clover.api.repository.game.LottoGameRepository
import io.mockk.coEvery
import io.mockk.mockk
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.test.runTest
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort

class LottoGameServiceTest {

    private val gameRepository: LottoGameRepository = mockk()
    private val lottoGameService = LottoGameService(gameRepository)

    @Test
    fun `getGamesByUserId should return list of games`() = runTest {
        // Given
        val userId = 1L
        val game = TestFixtures.createLottoGame(userId = userId)
        val pageable = PageRequest.of(0, 20, Sort.by("createdAt").descending())
        
        coEvery { gameRepository.findByUserId(userId, pageable) } returns flowOf(game)

        // When
        val result = lottoGameService.getGamesByUserId(userId)

        // Then
        assertEquals(1, result.size)
        assertEquals(game, result[0])
    }

    @Test
    fun `saveGame should return saved game`() = runTest {
        // Given
        val game = TestFixtures.createLottoGame()
        coEvery { gameRepository.save(game) } returns game

        // When
        val result = lottoGameService.saveGame(game)

        // Then
        assertEquals(game, result)
    }
}
