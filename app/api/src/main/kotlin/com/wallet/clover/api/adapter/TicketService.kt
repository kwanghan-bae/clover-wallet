package com.wallet.clover.api.adapter

import com.wallet.clover.adapter.DocumentParser
import com.wallet.clover.adapter.LottoTicketClient
import com.wallet.clover.domain.game.outgoing.LottoGameSavePort
import com.wallet.clover.domain.ticket.LottoTicket
import com.wallet.clover.domain.ticket.incoming.SaveLottoTicketUseCase
import com.wallet.clover.domain.ticket.incoming.SaveScannedTicketCommand
import com.wallet.clover.domain.ticket.outgoing.LottoTicketLoadPort
import com.wallet.clover.domain.ticket.outgoing.LottoTicketSavePort
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Transactional(readOnly = true)
class TicketService(
    val lottoTicketSavePort: LottoTicketSavePort,
    val lottoTicketLoadPort: LottoTicketLoadPort,
    val lottoGameSavePort: LottoGameSavePort,
    val lottoTicketFeignClient: LottoTicketClient,
) : SaveLottoTicketUseCase {
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
}
