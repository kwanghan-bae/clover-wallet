package com.wallet.clover.domain.ticket.incoming

import com.wallet.clover.domain.ticket.LottoTicket

interface GetLottoTicketQuery {
    fun byId(id: Long): LottoTicket
}
