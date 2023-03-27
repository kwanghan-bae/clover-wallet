package com.wallet.clover.api.adapter

import com.wallet.clover.adapter.DocumentParser
import com.wallet.clover.adapter.LottoTicketClient
import com.wallet.clover.domain.game.outgoing.SaveLottoGamePort
import com.wallet.clover.domain.ticket.incoming.SaveLottoTicketUseCase
import com.wallet.clover.domain.ticket.incoming.SaveScannedTicketCommand
import com.wallet.clover.domain.ticket.outgoing.LoadLottoTicketPort
import com.wallet.clover.domain.ticket.outgoing.SaveLottoTicketPort
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Transactional(readOnly = true)
class TicketService(
    val saveLottoTicketPort: SaveLottoTicketPort,
    val loadLottoTicketPort: LoadLottoTicketPort,
    val saveLottoGamePort: SaveLottoGamePort,
    val lottoTicketFeignClient: LottoTicketClient,
) : SaveLottoTicketUseCase {
    @Transactional
    override fun saveScannedTicket(command: SaveScannedTicketCommand): com.wallet.clover.domain.ticket.LottoTicket {
        val preRegistered = loadLottoTicketPort.byUserIdAndUrl(command.userId, command.url)
        return preRegistered ?: kotlin.run {
            val document = lottoTicketFeignClient.getDocumentByUrl(command.url)
            val ticket = saveLottoTicketPort.saveImmediately(
                com.wallet.clover.domain.ticket.LottoTicket(
                    userId = command.userId,
                    url = command.url,
                    ordinal = DocumentParser.getOrdinal(document),
                    status = DocumentParser.getTicketStatus(document),
                ),
            )
            val games = DocumentParser.getGames(command.userId, ticket.id, document)
            saveLottoGamePort.saveAll(games)
            ticket
        }
    }
}
