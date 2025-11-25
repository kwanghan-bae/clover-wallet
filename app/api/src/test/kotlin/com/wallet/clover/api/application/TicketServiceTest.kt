package com.wallet.clover.api.application

import com.wallet.clover.adapter.LottoTicketClient
import com.wallet.clover.domain.game.LottoGame
import com.wallet.clover.domain.game.LottoGameStatus
import com.wallet.clover.domain.ticket.LottoTicket
import com.wallet.clover.domain.ticket.LottoTicketStatus
import com.wallet.clover.domain.ticket.SaveScannedTicketCommand
import com.wallet.clover.domain.ticket.parser.ParsedGame
import com.wallet.clover.domain.ticket.parser.ParsedTicket
import com.wallet.clover.domain.ticket.parser.TicketParser
import com.wallet.clover.repository.game.LottoGameRdbAdaptor
import com.wallet.clover.repository.ticket.LottoTicketRdbAdaptor
import io.mockk.every
import io.mockk.mockk
import io.mockk.slot
import io.mockk.verify
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test

@DisplayName("TicketService 테스트")
class TicketServiceTest {

    private lateinit var lottoTicketRdbAdaptor: LottoTicketRdbAdaptor
    private lateinit var lottoGameRdbAdaptor: LottoGameRdbAdaptor
    private lateinit var lottoTicketFeignClient: LottoTicketClient
    private lateinit var ticketParser: TicketParser
    private lateinit var ticketService: TicketService

    @BeforeEach
    fun setUp() {
        lottoTicketRdbAdaptor = mockk()
        lottoGameRdbAdaptor = mockk()
        lottoTicketFeignClient = mockk()
        ticketParser = mockk()
        ticketService = TicketService(
            lottoTicketRdbAdaptor,
            lottoGameRdbAdaptor,
            lottoTicketFeignClient,
            ticketParser,
        )
    }

    @Test
    @DisplayName("새 티켓을 스캔하여 저장한다")
    fun `save new scanned ticket`() {
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
        val savedTicket = LottoTicket(
            id = 1L,
            userId = command.userId,
            url = command.url,
            ordinal = parsedTicket.ordinal,
            status = parsedTicket.status,
        )
        val gamesSlot = slot<List<LottoGame>>()

        every { lottoTicketRdbAdaptor.byUserIdAndUrl(command.userId, command.url) } returns null
        every { lottoTicketFeignClient.getHtmlByUrl(command.url) } returns html
        every { ticketParser.parse(html) } returns parsedTicket
        every { lottoTicketRdbAdaptor.saveImmediately(any()) } returns savedTicket
        every { lottoGameRdbAdaptor.saveAll(capture(gamesSlot)) } returns Unit

        // when
        val result = ticketService.saveScannedTicket(command)

        // then
        assertEquals(savedTicket, result)
        verify(exactly = 1) { lottoTicketRdbAdaptor.saveImmediately(any()) }
        verify(exactly = 1) { lottoGameRdbAdaptor.saveAll(any()) }

        val capturedGames = gamesSlot.captured
        assertEquals(1, capturedGames.size)
        assertEquals(savedTicket.id, capturedGames[0].ticketId)
        assertEquals(command.userId, capturedGames[0].userId)
    }

    @Test
    @DisplayName("이미 저장된 티켓을 스캔하면 기존 티켓을 반환한다")
    fun `scan an already saved ticket`() {
        // given
        val command = SaveScannedTicketCommand(userId = 1L, url = "http://example.com")
        val existingTicket = LottoTicket(
            id = 1L,
            userId = command.userId,
            url = command.url,
            ordinal = 999,
            status = LottoTicketStatus.LOSING,
        )

        every { lottoTicketRdbAdaptor.byUserIdAndUrl(command.userId, command.url) } returns existingTicket

        // when
        val result = ticketService.saveScannedTicket(command)

        // then
        assertEquals(existingTicket, result)
        verify(exactly = 0) { lottoTicketFeignClient.getHtmlByUrl(any()) }
        verify(exactly = 0) { ticketParser.parse(any()) }
        verify(exactly = 0) { lottoTicketRdbAdaptor.saveImmediately(any()) }
        verify(exactly = 0) { lottoGameRdbAdaptor.saveAll(any()) }
    }
}
