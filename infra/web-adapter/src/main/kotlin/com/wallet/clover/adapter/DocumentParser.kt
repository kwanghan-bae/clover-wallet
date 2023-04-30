package com.wallet.clover.adapter

import com.wallet.clover.domain.game.LottoGame
import com.wallet.clover.domain.game.LottoGameStatus
import com.wallet.clover.domain.ticket.LottoTicketStatus
import org.jsoup.nodes.Document

object DocumentParser {
    fun getOrdinal(document: Document): Int {
        val content = document.select("h3 > span.key_clr1").text()
        return content.filter { it.isDigit() }.toInt()
    }

    fun getTicketStatus(document: Document): LottoTicketStatus {
        // sample of real html
        // 낙첨되었습니다.
        // 미추첨 복권입니다.
        // 총 5,000원 당첨
        val content = document.select("div.bx_notice > div > strong").text()
        return when {
            content.contains("낙첨") -> LottoTicketStatus.LOSING
            content.contains("미추첨") -> LottoTicketStatus.STASHED
            content.contains("당첨") -> LottoTicketStatus.WINNING
            else -> throw RuntimeException("$content 는 식별할 수 없는 문구 입니다.")
        }
    }

    fun getGames(userId: Long, ticketId: Long, document: Document): List<LottoGame> {
        val gameList = getGameList(document)
            .chunked(6)
        val resultList = getGameResult(document)
        val countOfGames = gameList.size - 1
        return (0..countOfGames).map { index ->
            LottoGame(
                ticketId = ticketId,
                userId = userId,
                status = LottoGameStatus.valueOfHtmlValue(resultList[index]),
                number1 = gameList[index][0].toInt(),
                number2 = gameList[index][1].toInt(),
                number3 = gameList[index][2].toInt(),
                number4 = gameList[index][3].toInt(),
                number5 = gameList[index][4].toInt(),
                number6 = gameList[index][5].toInt(),
            )
        }
    }

    private fun getGameList(document: Document): List<String> {
        return document.select("span.clr").map { it.text() }
    }

    private fun getGameResult(document: Document): List<String> {
        return document.select("td.result").map { it.text() }
    }
}
