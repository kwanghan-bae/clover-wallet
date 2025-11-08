package com.wallet.clover.domain.ticket

interface LottoTicketSavePort {
    fun saveImmediately(domain: LottoTicket): LottoTicket
}
