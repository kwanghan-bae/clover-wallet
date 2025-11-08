package com.wallet.clover.domain.ticket

interface LottoTicketLoadPort {
    fun byUserIdAndUrl(userId: Long, url: String): LottoTicket?

    fun byUserId(userId: Long): List<LottoTicket>

    fun byId(ticketId: Long): LottoTicket
}
