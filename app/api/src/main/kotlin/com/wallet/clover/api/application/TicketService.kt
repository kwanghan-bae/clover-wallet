package com.wallet.clover.api.application

import com.wallet.clover.adapter.DocumentParser
import com.wallet.clover.adapter.LottoTicketClient
import com.wallet.clover.domain.game.LottoGame
import com.wallet.clover.domain.game.LottoGameLoadListPort
import com.wallet.clover.domain.game.LottoGameSavePort
import com.wallet.clover.domain.ticket.GetLottoTicketListQuery
import com.wallet.clover.domain.ticket.GetLottoTicketQuery
import com.wallet.clover.domain.ticket.LottoTicket
import com.wallet.clover.domain.ticket.LottoTicketLoadPort
import com.wallet.clover.domain.ticket.LottoTicketSavePort
import com.wallet.clover.domain.ticket.SaveLottoTicketUseCase
import com.wallet.clover.domain.ticket.SaveScannedTicketCommand
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Transactional(readOnly = true)
class TicketService(
    val lottoTicketSavePort: LottoTicketSavePort,
    val lottoTicketLoadPort: LottoTicketLoadPort,
    val lottoGameSavePort: LottoGameSavePort,
    val lottoGameLoadListPort: LottoGameLoadListPort,
    val lottoTicketFeignClient: LottoTicketClient,
) : SaveLottoTicketUseCase, GetLottoTicketQuery, GetLottoTicketListQuery {
    @Transactional
    override fun saveScannedTicket(command: SaveScannedTicketCommand): LottoTicket {
        val preRegistered = lottoTicketLoadPort.byUserIdAndUrl(command.userId, command.url)
        return preRegistered ?: kotlin.run {
            val document = lottoTicketFeignClient.getDocumentByUrl(command.url)
            val ticket = lottoTicketSavePort.saveImmediately(
                LottoTicket(
                    userId = command.userId,
                    url = command.url,
                    ordinal = DocumentParser.getOrdinal(document),
                    status = DocumentParser.getTicketStatus(document),
                ),
            )
            val games = DocumentParser.getGames(command.userId, ticket.id, document)
            lottoGameSavePort.saveAll(games)
            ticket
        }
    }

    override fun byUserId(userId: Long): List<LottoTicket> {
        return lottoTicketLoadPort.byUserId(userId)
    }

    override fun byId(ticketId: Long): LottoTicket {
        return lottoTicketLoadPort.byId(ticketId)
    }

    fun getGamesByTicketId(ticketId: Long): List<LottoGame> {
        return lottoGameLoadListPort.byTicketId(ticketId)
    }
}
