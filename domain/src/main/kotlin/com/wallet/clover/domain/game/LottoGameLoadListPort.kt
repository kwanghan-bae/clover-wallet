package com.wallet.clover.domain.game

interface LottoGameLoadListPort {
    fun byUserId(userId: Long): List<com.wallet.clover.domain.game.LottoGame>

    fun byTicketId(ticketId: Long): List<com.wallet.clover.domain.game.LottoGame>
}
