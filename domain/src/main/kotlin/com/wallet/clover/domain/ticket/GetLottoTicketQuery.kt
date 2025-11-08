package com.wallet.clover.domain.ticket

interface GetLottoTicketQuery {
    fun byId(id: Long): LottoTicket
}
