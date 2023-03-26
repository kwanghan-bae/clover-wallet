package com.lotto.manager.domain.ticket.incoming

import com.lotto.manager.domain.ticket.LottoTicket

interface GetLottoTicketListQuery {
    fun byUserId(userId: Long): List<LottoTicket>
}
