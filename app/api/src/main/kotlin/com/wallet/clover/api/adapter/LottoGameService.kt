package com.wallet.clover.api.adapter

import com.wallet.clover.domain.game.LottoGame
import com.wallet.clover.domain.game.incoming.GetLottoGameListQuery
import com.wallet.clover.domain.game.outgoing.LottoGameLoadListPort
import org.springframework.stereotype.Service

@Service
class LottoGameService(
    val lottoGameLoadListPort: LottoGameLoadListPort,
) : GetLottoGameListQuery {
    override fun byTicketId(ticketId: Long): List<LottoGame> {
        return lottoGameLoadListPort.byTicketId(ticketId)
    }
}
