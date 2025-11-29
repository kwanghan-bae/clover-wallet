package com.wallet.clover.api.service

import com.wallet.clover.api.client.LottoTicketClient
import com.wallet.clover.api.client.ParsedGame
import com.wallet.clover.api.client.ParsedTicket
import com.wallet.clover.api.client.TicketParser
import com.wallet.clover.api.dto.SaveScannedTicketCommand
import com.wallet.clover.api.entity.game.LottoGameEntity
import com.wallet.clover.api.entity.game.LottoGameStatus
import com.wallet.clover.api.entity.ticket.LottoTicketEntity
import com.wallet.clover.api.entity.ticket.LottoTicketStatus
import com.wallet.clover.api.repository.game.LottoGameRepository
import com.wallet.clover.api.repository.ticket.LottoTicketRepository
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.mockk
import io.mockk.slot
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.test.runTest
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test

@DisplayName("TicketService 테스트")
class TicketServiceTest {

    private lateinit var ticketRepository: LottoTicketRepository
    private lateinit var gameRepository: LottoGameRepository
    private lateinit var lottoTicketClient: LottoTicketClient
    private lateinit var ticketParser: TicketParser
    private lateinit var ticketService: TicketService

    @BeforeEach
    fun setUp() {
        ticketRepository = mockk()
        gameRepository = mockk()
        lottoTicketClient = mockk()
        ticketParser = mockk()
        ticketService = TicketService(
            ticketRepository,
            gameRepository,
            lottoTicketClient,
            ticketParser,
        )
    }

    @Test
    @DisplayName("새 티켓을 스캔하여 저장한다")
    fun `save new scanned ticket`() = runTest {
        // given
        val command = SaveScannedTicketCommand(userId = 1L, url = "http://example.com")
        val html = "<html>...</html>"
        val parsedTicket = ParsedTicket(
            ordinal = 1000,
            status = LottoTicketStatus.WINNING,
            games = listOf(
                ParsedGame(LottoGameStatus.WINNING_1, 1, 2, 3, 4, 5, 6),
            ),
        )
        val savedTicket = LottoTicketEntity(
            id = 1L,
            userId = command.userId,
            url = command.url,
            ordinal = parsedTicket.ordinal,
            status = parsedTicket.status,
        )
        val gamesSlot = slot<List<LottoGameEntity>>()

        coEvery { ticketRepository.findByUrl(command.url) } returns null
        coEvery { lottoTicketClient.getHtmlByUrl(command.url) } returns html
        coEvery { ticketParser.parse(html) } returns parsedTicket
        coEvery { ticketRepository.save(any()) } returns savedTicket
        coEvery { gameRepository.saveAll(capture(gamesSlot)) } returns flowOf()

        // when
        val result = ticketService.saveScannedTicket(command)

        // then
        assertEquals(savedTicket, result)
        coVerify(exactly = 1) { ticketRepository.save(any()) }
        coVerify(exactly = 1) { gameRepository.saveAll(any<List<LottoGameEntity>>()) }

        val capturedGames = gamesSlot.captured
        assertEquals(1, capturedGames.size)
        assertEquals(savedTicket.id, capturedGames[0].ticketId)
        assertEquals(command.userId, capturedGames[0].userId)
    }

    @Test
    @DisplayName("이미 저장된 티켓을 스캔하면 기존 티켓을 반환한다")
    fun `scan an already saved ticket`() = runTest {
        // given
        val command = SaveScannedTicketCommand(userId = 1L, url = "http://example.com")
        val existingTicket = LottoTicketEntity(
            id = 1L,
            userId = command.userId,
            url = command.url,
            ordinal = 999,
            status = LottoTicketStatus.LOSING,
        )

        coEvery { ticketRepository.findByUrl(command.url) } returns existingTicket

        // when
        val result = ticketService.saveScannedTicket(command)

        // then
        assertEquals(existingTicket, result)
        coVerify(exactly = 0) { lottoTicketClient.getHtmlByUrl(any()) }
        coVerify(exactly = 0) { ticketParser.parse(any()) }
        coVerify(exactly = 0) { ticketRepository.save(any()) }
        coVerify(exactly = 0) { gameRepository.saveAll(any<List<LottoGameEntity>>()) }
    }
}
