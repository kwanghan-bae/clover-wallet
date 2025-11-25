package com.wallet.clover.api.application

import com.wallet.clover.adapter.LottoTicketClient
import com.wallet.clover.domain.game.LottoGame
import com.wallet.clover.domain.ticket.LottoTicket
import com.wallet.clover.domain.ticket.SaveScannedTicketCommand
import com.wallet.clover.domain.ticket.parser.TicketParser
import com.wallet.clover.repository.game.LottoGameRdbAdaptor
import com.wallet.clover.repository.ticket.LottoTicketRdbAdaptor
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Transactional(readOnly = true)
class TicketService(
    val lottoTicketRdbAdaptor: LottoTicketRdbAdaptor,
    val lottoGameRdbAdaptor: LottoGameRdbAdaptor,
    val lottoTicketFeignClient: LottoTicketClient,
    val ticketParser: TicketParser,
) {
    @Transactional
    fun saveScannedTicket(command: SaveScannedTicketCommand): LottoTicket {
        val preRegistered = lottoTicketRdbAdaptor.byUserIdAndUrl(command.userId, command.url)
        if (preRegistered != null) {
            return preRegistered
        }

        val html = lottoTicketFeignClient.getHtmlByUrl(command.url)
        val parsedTicket = ticketParser.parse(html)

        val ticket = lottoTicketRdbAdaptor.saveImmediately(
            LottoTicket(
                userId = command.userId,
                url = command.url,
                ordinal = parsedTicket.ordinal,
                status = parsedTicket.status,
            ),
        )

        val games = parsedTicket.games.map {
            LottoGame(
                ticketId = ticket.id,
                userId = command.userId,
                status = it.status,
                number1 = it.number1,
                number2 = it.number2,
                number3 = it.number3,
                number4 = it.number4,
                number5 = it.number5,
                number6 = it.number6,
            )
        }
        lottoGameRdbAdaptor.saveAll(games)
        return ticket
    }

    fun byUserId(userId: Long): List<LottoTicket> {
        return lottoTicketRdbAdaptor.byUserId(userId)
    }

    fun byId(ticketId: Long): LottoTicket {
        return lottoTicketRdbAdaptor.byId(ticketId)
    }

    fun getGamesByTicketId(ticketId: Long): List<LottoGame> {
        return lottoGameRdbAdaptor.byTicketId(ticketId)
    }
}
