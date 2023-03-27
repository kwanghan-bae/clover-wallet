package com.wallet.clover.domain.game.incoming

import com.wallet.clover.domain.game.LottoGame

interface GetLottoGameListQuery {
    fun byTicketId(ticketId: Long): List<com.wallet.clover.domain.game.LottoGame>
}
