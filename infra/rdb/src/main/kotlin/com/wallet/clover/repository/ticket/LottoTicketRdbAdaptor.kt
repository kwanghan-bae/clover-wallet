package com.wallet.clover.repository.ticket

import com.wallet.clover.domain.ticket.LottoTicket
import com.wallet.clover.entity.ticket.toDomain
import com.wallet.clover.entity.ticket.toEntity
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Component

@Component
class LottoTicketRdbAdaptor(
    private val repository: LottoTicketRepository,
) {
    fun byUserIdAndUrl(userId: Long, url: String): LottoTicket? {
        return repository.findByUserIdAndUrl(userId, url)?.toDomain()
    }

    fun byUserId(userId: Long): List<LottoTicket> {
        return repository.findByUserId(userId).map { it.toDomain() }
    }

    fun byId(ticketId: Long): LottoTicket {
        return repository.findByIdOrNull(ticketId)?.toDomain() ?: throw RuntimeException()
    }

    fun saveImmediately(domain: LottoTicket): LottoTicket {
        return repository.save(domain.toEntity()).toDomain()
    }
}
