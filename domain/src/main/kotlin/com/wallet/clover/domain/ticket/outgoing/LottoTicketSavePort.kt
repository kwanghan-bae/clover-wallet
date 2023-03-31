package com.wallet.clover.domain.ticket.outgoing

import com.wallet.clover.domain.ticket.LottoTicket

interface LottoTicketSavePort {
    fun saveImmediately(domain: LottoTicket): LottoTicket
}
