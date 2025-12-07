package com.wallet.clover.api.client

import com.wallet.clover.api.config.LottoScrapingProperties
import com.wallet.clover.api.client.ParsedGame
import com.wallet.clover.api.client.ParsedTicket
import com.wallet.clover.api.client.TicketParser
import com.wallet.clover.api.entity.game.LottoGameStatus
import com.wallet.clover.api.entity.ticket.LottoTicketStatus
import com.wallet.clover.api.exception.TicketParsingException
import org.jsoup.Jsoup
import org.jsoup.nodes.Document
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component

@Component
class JsoupTicketParser(
    private val properties: LottoScrapingProperties
) : TicketParser {
    private val logger = LoggerFactory.getLogger(javaClass)

    companion object {
        private const val STATUS_WINNING = "당첨"
        private const val STATUS_LOSING = "낙첨"
        private const val STATUS_DRAWING = "추첨"
        
        private const val GAME_WINNING_1 = "1등당첨"
        private const val GAME_WINNING_2 = "2등당첨"
        private const val GAME_WINNING_3 = "3등당첨"
        private const val GAME_WINNING_4 = "4등당첨"
        private const val GAME_WINNING_5 = "5등당첨"
    }

    override fun parse(html: String): ParsedTicket {
        val document = Jsoup.parse(html)
        val ordinal = getOrdinal(document)
        val status = getTicketStatus(document)
        val games = getGames(document)
        return ParsedTicket(ordinal, status, games)
    }

    private fun getOrdinal(document: Document): Int {
        val content = document.select(properties.ordinalSelector).firstOrNull()?.text() ?: "0"
        logger.debug("파싱된 회차 내용: {}", content)
        return content.filter { it.isDigit() }.toIntOrNull() ?: 0
    }

    private fun getTicketStatus(document: Document): LottoTicketStatus {
        val content = document.select(properties.ticketStatusSelector).firstOrNull()?.text() ?: ""
        logger.debug("파싱된 티켓 상태 내용: {}", content)
        return when {
            content.contains(STATUS_WINNING) -> LottoTicketStatus.WINNING
            content.contains(STATUS_LOSING) -> LottoTicketStatus.LOSING
            content.contains(STATUS_DRAWING) -> LottoTicketStatus.STASHED
            else -> {
                logger.error("식별할 수 없는 티켓 상태 내용: {}", content)
                throw TicketParsingException("'$content' 는 식별할 수 없는 문구 입니다.")
            }
        }
    }

    private fun getGames(document: Document): List<ParsedGame> {
        logger.info("문서에서 게임 파싱 중")
        val gameRows = document.select(properties.gameRowsSelector)
        return gameRows.map { row ->
            val resultText = row.select(properties.gameResultSelector).text().trim()
            val numbers = row.select(properties.gameNumbersSelector).mapNotNull { it.text().toIntOrNull() }

            if (numbers.size != 6) {
                logger.error("파싱된 게임의 번호 개수가 올바르지 않습니다: {}", numbers)
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
            logger.info("{}개의 게임 파싱 성공.", it.size)
        }
    }

    private fun parseGameStatus(htmlValue: String): LottoGameStatus {
        return when (htmlValue) {
            GAME_WINNING_1 -> LottoGameStatus.WINNING_1
            GAME_WINNING_2 -> LottoGameStatus.WINNING_2
            GAME_WINNING_3 -> LottoGameStatus.WINNING_3
            GAME_WINNING_4 -> LottoGameStatus.WINNING_4
            GAME_WINNING_5 -> LottoGameStatus.WINNING_5
            else -> LottoGameStatus.LOSING
        }
    }
}
