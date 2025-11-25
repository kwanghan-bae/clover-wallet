package com.wallet.clover.domain.ticket.parser

import com.wallet.clover.domain.game.LottoGameStatus
import com.wallet.clover.domain.ticket.LottoTicketStatus

data class ParsedGame(
    val status: LottoGameStatus,
    val number1: Int,
    val number2: Int,
    val number3: Int,
    val number4: Int,
    val number5: Int,
    val number6: Int,
)

data class ParsedTicket(
    val ordinal: Int,
    val status: LottoTicketStatus,
    val games: List<ParsedGame>,
)

interface TicketParser {
    fun parse(html: String): ParsedTicket
}
