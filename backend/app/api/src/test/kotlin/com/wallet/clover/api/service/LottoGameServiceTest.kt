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

    @Test
    fun `saveGeneratedGame should create virtual ticket and save game`() = runTest {
        // Given
        val request = com.wallet.clover.api.dto.LottoGame.SaveRequest(
            userId = 1L,
            numbers = listOf(1, 2, 3, 4, 5, 6),
            extractionMethod = com.wallet.clover.api.domain.extraction.ExtractionMethod.DREAM
        )
        val virtualTicket = TestFixtures.createLottoTicket(id = 100L, userId = 1L, ordinal = 0)
        val savedGame = TestFixtures.createLottoGame(id = 200L, userId = 1L, ticketId = 100L)

        coEvery { ticketRepository.save(any()) } returns virtualTicket
        coEvery { gameRepository.save(any()) } returns savedGame
        coEvery { badgeService.updateUserBadges(1L) } just Runs

        // When
        val result = lottoGameService.saveGeneratedGame(request)

        // Then
        assertEquals(savedGame, result)
        coVerify { ticketRepository.save(match { it.ordinal == 0 }) }
        coVerify { gameRepository.save(match { it.extractionMethod == com.wallet.clover.api.domain.extraction.ExtractionMethod.DREAM }) }
        coVerify { badgeService.updateUserBadges(1L) }
    }
}
