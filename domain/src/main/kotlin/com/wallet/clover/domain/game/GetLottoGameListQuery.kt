package com.wallet.clover.domain.game

interface GetLottoGameListQuery {
    fun byTicketId(ticketId: Long): List<LottoGame>
}
