package com.wallet.clover.domain.ticket.incoming

import com.wallet.clover.domain.ticket.LottoTicket

interface GetLottoTicketListQuery {
    fun byUserId(userId: Long): List<LottoTicket>
}
