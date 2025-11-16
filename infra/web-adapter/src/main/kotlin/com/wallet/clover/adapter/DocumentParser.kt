package com.wallet.clover.adapter

import com.wallet.clover.domain.game.LottoGame
import com.wallet.clover.domain.game.LottoGameStatus
import com.wallet.clover.domain.ticket.LottoTicketStatus
import org.jsoup.nodes.Document
import org.slf4j.LoggerFactory

object DocumentParser {
    private val logger = LoggerFactory.getLogger(javaClass)

    fun getOrdinal(document: Document): Int {
        val content = document.select("h3 > span.key_clr1").firstOrNull()?.text() ?: "0"
        logger.debug("Parsed ordinal content: {}", content)
        return content.filter { it.isDigit() }.toIntOrNull() ?: 0
    }

    fun getTicketStatus(document: Document): LottoTicketStatus {
        val content = document.select("div.bx_notice.winner strong").firstOrNull()?.text() ?: ""
        logger.debug("Parsed ticket status content: {}", content)
        return when {
            content.contains("당첨") -> LottoTicketStatus.WINNING
            content.contains("낙첨") -> LottoTicketStatus.LOSING
            content.contains("추첨") -> LottoTicketStatus.STASHED // "미추첨" 대신 "추첨" 키워드 사용
            else -> {
                logger.error("Unidentifiable ticket status content: {}", content)
                throw DocumentParsingException("'$content' 는 식별할 수 없는 문구 입니다.")
            }
        }
    }

    fun getGames(userId: Long, ticketId: Long, document: Document): List<LottoGame> {
        logger.info("Parsing games for userId: {}, ticketId: {}", userId, ticketId)
        val gameRows = document.select("div.list_my_number table tbody tr")
        return gameRows.map { row ->
            val resultText = row.select("td.result").text().trim()
            val numbers = row.select("td span.clr").mapNotNull { it.text().toIntOrNull() }

            if (numbers.size != 6) {
                logger.error("Parsed game has incorrect number count: {}", numbers)
                throw DocumentParsingException("게임의 번호가 6개가 아닙니다.")
            }

            LottoGame(
                ticketId = ticketId,
                userId = userId,
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
