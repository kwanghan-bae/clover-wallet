package com.lotto.manager.domain.ticket.outgoing

import com.lotto.manager.domain.ticket.LottoTicket

interface SaveLottoTicketPort {
    fun save(domain: LottoTicket)
}
