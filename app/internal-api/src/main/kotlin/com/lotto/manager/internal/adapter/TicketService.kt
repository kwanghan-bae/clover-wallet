package com.lotto.manager.internal.adapter

import com.lotto.manager.adapter.DocumentParser
import com.lotto.manager.adapter.LottoTicketClient
import com.lotto.manager.domain.game.outgoing.SaveLottoGamePort
import com.lotto.manager.domain.ticket.LottoTicket
import com.lotto.manager.domain.ticket.incoming.SaveScannedTicketCommand
import com.lotto.manager.domain.ticket.incoming.SaveLottoTicketUseCase
import com.lotto.manager.domain.ticket.outgoing.LoadLottoTicketPort
import com.lotto.manager.domain.ticket.outgoing.SaveLottoTicketPort
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Transactional(readOnly = true)
class TicketService(
    val saveLottoTicketPort: SaveLottoTicketPort,
    val loadLottoTicketPort: LoadLottoTicketPort,
    val saveLottoGamePort: SaveLottoGamePort,
    val lottoTicketFeignClient: LottoTicketClient
) : SaveLottoTicketUseCase {
    @Transactional
    override fun saveScannedTicket(command: SaveScannedTicketCommand): LottoTicket {
        val preRegistered = loadLottoTicketPort.byUserIdAndUrl(command.userId, command.url)
        return preRegistered ?: kotlin.run {
            val document = lottoTicketFeignClient.getDocumentByUrl(command.url)
            val ticket = saveLottoTicketPort.saveImmediately(
                LottoTicket(
                    userId = command.userId,
                    url = command.url,
                    ordinal = DocumentParser.getOrdinal(document),
                    status = DocumentParser.getTicketStatus(document),
                )
            )
            val games = DocumentParser.getGames(command.userId, ticket.id, document)
            saveLottoGamePort.saveAll(games)
            ticket
        }
    }
}
