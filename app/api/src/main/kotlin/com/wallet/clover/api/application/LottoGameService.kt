package com.wallet.clover.api.application

import com.wallet.clover.domain.game.LottoGame
import com.wallet.clover.domain.game.GetLottoGameListQuery
import com.wallet.clover.domain.game.LottoGameLoadListPort
import org.springframework.stereotype.Service

@Service
class LottoGameService(
    val lottoGameLoadListPort: LottoGameLoadListPort,
) : GetLottoGameListQuery {
    override fun byTicketId(ticketId: Long): List<LottoGame> {
        return lottoGameLoadListPort.byTicketId(ticketId)
    }
}
