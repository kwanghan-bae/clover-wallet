package com.lotto.manager.domain.game.incoming

import com.lotto.manager.domain.game.LottoGame

interface GetLottoGameListQuery {
    fun byTicketId(ticketId: Long): List<LottoGame>
}
