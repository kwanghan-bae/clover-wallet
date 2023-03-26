package com.lotto.manager.domain.game.outgoing

import com.lotto.manager.domain.game.LottoGame

interface LoadLottoGameListPort {
    fun byUserId(userId: Long): List<LottoGame>

    fun byTicketId(ticketId: Long): List<LottoGame>
}
