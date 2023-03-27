package com.wallet.clover.domain.ticket.outgoing

import com.wallet.clover.domain.ticket.LottoTicket

interface SaveLottoTicketPort {
    fun saveImmediately(domain: LottoTicket): LottoTicket
}
