package com.wallet.clover.adapter

import com.wallet.clover.domain.game.LottoGameStatus
import com.wallet.clover.domain.ticket.LottoTicketStatus
import com.wallet.clover.domain.ticket.parser.ParsedGame
import com.wallet.clover.domain.ticket.parser.ParsedTicket
import com.wallet.clover.domain.ticket.parser.TicketParser
import com.wallet.clover.domain.ticket.parser.TicketParsingException
import org.jsoup.Jsoup
import org.jsoup.nodes.Document
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component

@Component
class JsoupTicketParser : TicketParser {
    private val logger = LoggerFactory.getLogger(javaClass)

    override fun parse(html: String): ParsedTicket {
        val document = Jsoup.parse(html)
        val ordinal = getOrdinal(document)
        val status = getTicketStatus(document)
        val games = getGames(document)
        return ParsedTicket(ordinal, status, games)
    }

    private fun getOrdinal(document: Document): Int {
        val content = document.select("h3 > span.key_clr1").firstOrNull()?.text() ?: "0"
        logger.debug("Parsed ordinal content: {}", content)
        return content.filter { it.isDigit() }.toIntOrNull() ?: 0
    }

    private fun getTicketStatus(document: Document): LottoTicketStatus {
        val content = document.select("div.bx_notice.winner strong").firstOrNull()?.text() ?: ""
        logger.debug("Parsed ticket status content: {}", content)
        return when {
            content.contains("당첨") -> LottoTicketStatus.WINNING
            content.contains("낙첨") -> LottoTicketStatus.LOSING
            content.contains("추첨") -> LottoTicketStatus.STASHED // "미추첨" 대신 "추첨" 키워드 사용
            else -> {
                logger.error("Unidentifiable ticket status content: {}", content)
                throw TicketParsingException("'$content' 는 식별할 수 없는 문구 입니다.")
            }
        }
    }

    private fun getGames(document: Document): List<ParsedGame> {
        logger.info("Parsing games from document")
        val gameRows = document.select("div.list_my_number table tbody tr")
        return gameRows.map { row ->
            val resultText = row.select("td.result").text().trim()
            val numbers = row.select("td span.clr").mapNotNull { it.text().toIntOrNull() }

            if (numbers.size != 6) {
                logger.error("Parsed game has incorrect number count: {}", numbers)
                throw TicketParsingException("게임의 번호가 6개가 아닙니다.")
            }

            ParsedGame(
                status = LottoGameStatus.valueOfHtmlValue(resultText),
                number1 = numbers[0],
                number2 = numbers[1],
                number3 = numbers[2],
                number4 = numbers[3],
                number5 = numbers[4],
                number6 = numbers[5],
            )
        }.also {
            logger.info("Successfully parsed {} games.", it.size)
        }
    }
}
