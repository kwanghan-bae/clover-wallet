package com.wallet.clover.api.service

import com.wallet.clover.api.TestFixtures
import com.wallet.clover.api.repository.game.LottoGameRepository
import com.wallet.clover.api.repository.ticket.LottoTicketRepository
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.mockk
import io.mockk.just
import io.mockk.Runs
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.test.runTest
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort

class LottoGameServiceTest {

    private val gameRepository: LottoGameRepository = mockk()
    private val ticketRepository: LottoTicketRepository = mockk()
    private val badgeService: BadgeService = mockk()
    
    private val lottoGameService = LottoGameService(
        gameRepository,
        ticketRepository,
        badgeService
    )

    @Test
    fun `getGamesByUserId should return list of games`() = runTest {
        // Given
        val userId = 1L
        val game = TestFixtures.createLottoGame(userId = userId)
        val pageable = PageRequest.of(0, 20, Sort.by("createdAt").descending())
        
        coEvery { gameRepository.findByUserId(userId, pageable) } returns flowOf(game)
        coEvery { gameRepository.countByUserId(userId) } returns 1L

        // When
        val result = lottoGameService.getGamesByUserId(userId)

        // Then
        assertEquals(1, result.content.size)
        assertEquals(game, result.content[0])
        assertEquals(1L, result.totalElements)
    }

    @Test
    fun `saveGame should return saved game`() = runTest {
        // Given
        val game = TestFixtures.createLottoGame()
        coEvery { gameRepository.save(game) } returns game
        coEvery { badgeService.updateUserBadges(any()) } just Runs

        // When
        val result = lottoGameService.saveGame(game)

        // Then
        assertEquals(game, result)
        coVerify { badgeService.updateUserBadges(game.userId) }
    }
}
