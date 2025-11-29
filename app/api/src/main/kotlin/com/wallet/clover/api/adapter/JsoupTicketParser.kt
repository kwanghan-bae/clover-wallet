package com.wallet.clover.api.adapter

import com.wallet.clover.api.domain.ticket.parser.ParsedGame
import com.wallet.clover.api.domain.ticket.parser.ParsedTicket
import com.wallet.clover.api.domain.ticket.parser.TicketParser
import com.wallet.clover.api.entity.game.LottoGameStatus
import com.wallet.clover.api.entity.ticket.LottoTicketStatus
import org.jsoup.Jsoup
import org.jsoup.nodes.Document
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component

class TicketParsingException(message: String) : RuntimeException(message)

@Component
class JsoupTicketParser : TicketParser {
    private val logger = LoggerFactory.getLogger(javaClass)

    companion object {
        private const val ORDINAL_SELECTOR = "h3 > span.key_clr1"
        private const val TICKET_STATUS_SELECTOR = "div.bx_notice.winner strong"
        private const val GAME_ROWS_SELECTOR = "div.list_my_number table tbody tr"
        private const val GAME_RESULT_SELECTOR = "td.result"
        private const val GAME_NUMBERS_SELECTOR = "td span.clr"
    }

    override fun parse(html: String): ParsedTicket {
        val document = Jsoup.parse(html)
        val ordinal = getOrdinal(document)
        val status = getTicketStatus(document)
        val games = getGames(document)
        return ParsedTicket(ordinal, status, games)
    }

    private fun getOrdinal(document: Document): Int {
        val content = document.select(ORDINAL_SELECTOR).firstOrNull()?.text() ?: "0"
        logger.debug("Parsed ordinal content: {}", content)
        return content.filter { it.isDigit() }.toIntOrNull() ?: 0
    }

    private fun getTicketStatus(document: Document): LottoTicketStatus {
        val content = document.select(TICKET_STATUS_SELECTOR).firstOrNull()?.text() ?: ""
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
        val gameRows = document.select(GAME_ROWS_SELECTOR)
        return gameRows.map { row ->
            val resultText = row.select(GAME_RESULT_SELECTOR).text().trim()
            val numbers = row.select(GAME_NUMBERS_SELECTOR).mapNotNull { it.text().toIntOrNull() }

            if (numbers.size != 6) {
                logger.error("Parsed game has incorrect number count: {}", numbers)
                throw TicketParsingException("게임의 번호가 6개가 아닙니다.")
            }

            ParsedGame(
                status = parseGameStatus(resultText),
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

    private fun parseGameStatus(htmlValue: String): LottoGameStatus {
        return when {
            (htmlValue == "1등당첨") -> LottoGameStatus.WINNING_1
            (htmlValue == "2등당첨") -> LottoGameStatus.WINNING_2
            (htmlValue == "3등당첨") -> LottoGameStatus.WINNING_3
            (htmlValue == "4등당첨") -> LottoGameStatus.WINNING_4
            (htmlValue == "5등당첨") -> LottoGameStatus.WINNING_5
            else -> LottoGameStatus.LOSING
        }
    }
}
