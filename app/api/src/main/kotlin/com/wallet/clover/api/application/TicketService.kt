package com.wallet.clover.api.application

import com.wallet.clover.adapter.DocumentParser
import com.wallet.clover.adapter.LottoTicketClient
import com.wallet.clover.domain.game.LottoGame
import com.wallet.clover.domain.ticket.LottoTicket
import com.wallet.clover.domain.ticket.SaveScannedTicketCommand
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
) {
    @Transactional
    fun saveScannedTicket(command: SaveScannedTicketCommand): LottoTicket {
        val preRegistered = lottoTicketRdbAdaptor.byUserIdAndUrl(command.userId, command.url)
        return preRegistered ?: kotlin.run {
            val document = lottoTicketFeignClient.getDocumentByUrl(command.url)
            val ticket = lottoTicketRdbAdaptor.saveImmediately(
                LottoTicket(
                    userId = command.userId,
                    url = command.url,
                    ordinal = DocumentParser.getOrdinal(document),
                    status = DocumentParser.getTicketStatus(document),
                ),
            )
            val games = DocumentParser.getGames(command.userId, ticket.id, document)
            lottoGameRdbAdaptor.saveAll(games)
            ticket
        }
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
