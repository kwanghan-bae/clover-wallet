package com.wallet.clover.domain.game.outgoing

import com.wallet.clover.domain.game.LottoGame

interface LoadLottoGameListPort {
    fun byUserId(userId: Long): List<com.wallet.clover.domain.game.LottoGame>

    fun byTicketId(ticketId: Long): List<com.wallet.clover.domain.game.LottoGame>
}
