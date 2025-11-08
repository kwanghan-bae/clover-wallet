package com.wallet.clover.api.endpoint

import com.fasterxml.jackson.annotation.JsonUnwrapped
import com.wallet.clover.domain.game.LottoGame
import com.wallet.clover.domain.ticket.LottoTicket

object Detail {
    data class Out(
        @JsonUnwrapped
        val ticket: LottoTicket,
        val games: kotlin.collections.List<LottoGame>,
    )
}
