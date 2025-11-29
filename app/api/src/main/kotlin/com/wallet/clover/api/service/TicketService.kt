package com.wallet.clover.api.service

import com.wallet.clover.api.adapter.LottoTicketClient
import com.wallet.clover.api.domain.ticket.parser.TicketParser
import com.wallet.clover.api.dto.SaveScannedTicketCommand
import com.wallet.clover.api.entity.game.LottoGameEntity
import com.wallet.clover.api.entity.ticket.LottoTicketEntity
import com.wallet.clover.api.repository.game.LottoGameRepository
import com.wallet.clover.api.repository.ticket.LottoTicketRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class TicketService(
    private val ticketRepository: LottoTicketRepository,
    private val gameRepository: LottoGameRepository,
    private val lottoTicketClient: LottoTicketClient,
    private val ticketParser: TicketParser,
) {
    suspend fun getMyTickets(userId: Long): List<LottoTicketEntity> {
        return ticketRepository.findByUserId(userId)
    }

    suspend fun getTicketById(ticketId: Long): LottoTicketEntity? {
        return ticketRepository.findById(ticketId)
    }

    suspend fun getGamesByTicketId(ticketId: Long): List<LottoGameEntity> {
        return gameRepository.findByTicketId(ticketId)
    }

    @Transactional
    suspend fun saveScannedTicket(command: SaveScannedTicketCommand): LottoTicketEntity {
        val existingTicket = ticketRepository.findByUrl(command.url)
        if (existingTicket != null) {
            return existingTicket
        }

        val html = lottoTicketClient.getHtmlByUrl(command.url)
        val parsedTicket = ticketParser.parse(html)

        val savedTicket = ticketRepository.save(
            LottoTicketEntity(
                userId = command.userId,
                url = command.url,
                ordinal = parsedTicket.ordinal,
                status = parsedTicket.status,
            )
        )

        val games = parsedTicket.games.map {
            LottoGameEntity(
                ticketId = savedTicket.id!!,
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
        gameRepository.saveAll(games)

        return savedTicket
    }
}
