package com.wallet.clover.api.client

import com.wallet.clover.api.config.LottoScrapingProperties
import com.wallet.clover.api.entity.game.LottoGameStatus
import com.wallet.clover.api.entity.ticket.LottoTicketStatus
import com.wallet.clover.api.exception.TicketParsingException
import io.mockk.every
import io.mockk.mockk
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

class JsoupTicketParserTest {

    private lateinit var properties: LottoScrapingProperties
    private lateinit var parser: JsoupTicketParser

    @BeforeEach
    fun setUp() {
        properties = mockk(relaxed = true)
        every { properties.ordinalSelector } returns ".ordinal"
        every { properties.ticketStatusSelector } returns ".status"
        every { properties.gameRowsSelector } returns ".game-row"
        every { properties.gameResultSelector } returns ".game-result"
        every { properties.gameNumbersSelector } returns ".game-number"
        parser = JsoupTicketParser(properties)
    }

    @Test
    fun `should parse valid ticket html correctly`() {
        val html = """
            <div>
                <span class="ordinal">1000회</span>
                <span class="status">당첨</span>
                <div class="game-row">
                    <span class="game-result">1등당첨</span>
                    <span class="game-number">1</span>
                    <span class="game-number">2</span>
                    <span class="game-number">3</span>
                    <span class="game-number">4</span>
                    <span class="game-number">5</span>
                    <span class="game-number">6</span>
                </div>
                <div class="game-row">
                    <span class="game-result">낙첨</span>
                    <span class="game-number">11</span>
                    <span class="game-number">12</span>
                    <span class="game-number">13</span>
                    <span class="game-number">14</span>
                    <span class="game-number">15</span>
                    <span class="game-number">16</span>
                </div>
            </div>
        """.trimIndent()

        val result = parser.parse(html)

        assertEquals(1000, result.ordinal)
        assertEquals(LottoTicketStatus.WINNING, result.status)
        assertEquals(2, result.games.size)
        
        assertEquals(LottoGameStatus.WINNING_1, result.games[0].status)
        assertEquals(1, result.games[0].number1)
        
        assertEquals(LottoGameStatus.LOSING, result.games[1].status)
        assertEquals(11, result.games[1].number1)
    }

    @Test
    fun `should throw exception when game has incorrect number count`() {
        val html = """
            <div>
                <span class="ordinal">1000회</span>
                <span class="status">당첨</span>
                <div class="game-row">
                    <span class="game-result">1등당첨</span>
                    <span class="game-number">1</span>
                    <!-- Missing numbers -->
                </div>
            </div>
        """.trimIndent()

        assertThrows(TicketParsingException::class.java) {
            parser.parse(html)
        }
    }
    
    @Test
    fun `should parse losing ticket correctly`() {
        val html = """
            <div>
                <span class="ordinal">1000회</span>
                <span class="status">낙첨</span>
            </div>
        """.trimIndent()

        val result = parser.parse(html)

        assertEquals(1000, result.ordinal)
        assertEquals(LottoTicketStatus.LOSING, result.status)
        assertEquals(0, result.games.size)
    }
    
    @Test
    fun `should parse drawing ticket correctly`() {
        val html = """
            <div>
                <span class="ordinal">1000회</span>
                <span class="status">추첨</span>
            </div>
        """.trimIndent()

        val result = parser.parse(html)

        assertEquals(1000, result.ordinal)
        assertEquals(LottoTicketStatus.STASHED, result.status)
    }
}
