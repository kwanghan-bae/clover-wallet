package com.wallet.clover.api.service

import com.wallet.clover.api.entity.game.LottoGameEntity
import com.wallet.clover.api.entity.ticket.LottoTicketEntity
import com.wallet.clover.api.repository.game.LottoGameRepository
import com.wallet.clover.api.repository.ticket.LottoTicketRepository
import org.springframework.stereotype.Service

@Service
class TicketService(
    private val ticketRepository: LottoTicketRepository,
    private val gameRepository: LottoGameRepository,
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
}
