package com.wallet.clover.domain.ticket

interface GetLottoTicketListQuery {
    fun byUserId(userId: Long): List<LottoTicket>
}
