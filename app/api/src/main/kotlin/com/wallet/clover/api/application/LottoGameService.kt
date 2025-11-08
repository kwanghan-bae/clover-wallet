package com.wallet.clover.api.application

import com.wallet.clover.domain.game.LottoGame
import com.wallet.clover.repository.game.LottoGameRdbAdaptor
import org.springframework.stereotype.Service

@Service
class LottoGameService(
    val lottoGameRdbAdaptor: LottoGameRdbAdaptor,
) {
    fun byTicketId(ticketId: Long): List<LottoGame> {
        return lottoGameRdbAdaptor.byTicketId(ticketId)
    }
}
