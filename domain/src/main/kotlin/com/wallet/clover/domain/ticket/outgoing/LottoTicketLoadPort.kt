package com.wallet.clover.domain.ticket.outgoing

import com.wallet.clover.domain.ticket.LottoTicket

interface LottoTicketLoadPort {
    fun byUserIdAndUrl(userId: Long, url: String): LottoTicket?
}
