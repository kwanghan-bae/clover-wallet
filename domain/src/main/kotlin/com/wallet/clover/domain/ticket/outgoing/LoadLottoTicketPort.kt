package com.wallet.clover.domain.ticket.outgoing

import com.wallet.clover.domain.ticket.LottoTicket

interface LoadLottoTicketPort {
    fun byUserIdAndUrl(userId: Long, url: String): com.wallet.clover.domain.ticket.LottoTicket?
}
