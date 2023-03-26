package com.lotto.manager.domain.ticket.outgoing

import com.lotto.manager.domain.ticket.LottoTicket

interface LoadLottoTicketPort {
    fun byUserIdAndUrl(userId: Long, url: String): LottoTicket?
}
