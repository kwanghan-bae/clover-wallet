package com.wallet.clover.api.client

import com.wallet.clover.api.config.LottoScrapingProperties
import com.wallet.clover.api.exception.TicketParsingException
import io.mockk.every
import io.mockk.mockk
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

class LottoResultParserTest {

    private lateinit var properties: LottoScrapingProperties
    private lateinit var parser: LottoResultParser

    @BeforeEach
    fun setUp() {
        properties = mockk(relaxed = true)
        every { properties.winRoundSelector } returns ".win_result strong"
        every { properties.winNumbersSelector } returns ".win_result .nums .ball_645"
        every { properties.bonusNumberSelector } returns ".win_result .bonus .ball_645"
        parser = LottoResultParser(properties)
    }

    @Test
    fun `should parse valid html correctly`() {
        val html = """
            <div class="win_result">
                <strong>1000회</strong>
                <div class="nums">
                    <span class="ball_645">1</span>
                    <span class="ball_645">2</span>
                    <span class="ball_645">3</span>
                    <span class="ball_645">4</span>
                    <span class="ball_645">5</span>
                    <span class="ball_645">6</span>
                </div>
                <div class="bonus">
                    <span class="ball_645">7</span>
                </div>
            </div>
        """.trimIndent()

        val result = parser.parse(html)

        assertEquals(1000, result.round)
        assertEquals(listOf(1, 2, 3, 4, 5, 6), result.winningNumbers)
        assertEquals(7, result.bonusNumber)
    }

    @Test
    fun `should throw exception when html is empty`() {
        assertThrows(TicketParsingException::class.java) {
            parser.parse("")
        }
    }

    @Test
    fun `should throw exception when parsing fails`() {
        val html = """
            <div class="win_result">
                <strong>1000회</strong>
                <!-- Missing numbers -->
            </div>
        """.trimIndent()

        assertThrows(TicketParsingException::class.java) {
            parser.parse(html)
        }
    }
}
