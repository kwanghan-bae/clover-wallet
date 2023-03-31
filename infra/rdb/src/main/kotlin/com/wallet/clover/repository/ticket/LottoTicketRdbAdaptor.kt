package com.wallet.clover.repository.ticket

import com.wallet.clover.domain.ticket.LottoTicket
import com.wallet.clover.domain.ticket.outgoing.LottoTicketLoadPort
import com.wallet.clover.domain.ticket.outgoing.LottoTicketSavePort
import com.wallet.clover.entity.ticket.toDomain
import com.wallet.clover.entity.ticket.toEntity
import org.springframework.stereotype.Component

@Component
class LottoTicketRdbAdaptor(
    private val repository: LottoTicketRepository,
) : LottoTicketLoadPort, LottoTicketSavePort {
    override fun byUserIdAndUrl(userId: Long, url: String): LottoTicket? {
        return repository.findByUserIdAndUrl(userId, url)?.toDomain()
    }

    override fun saveImmediately(domain: LottoTicket): LottoTicket {
        return repository.save(domain.toEntity()).toDomain()
    }
}
