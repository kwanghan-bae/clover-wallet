package com.wallet.clover.api.endpoint

import com.wallet.clover.domain.ticket.LottoTicket

object List {
    data class In(
        val userId: Long,
    )

    data class Out(
        val tickets: kotlin.collections.List<LottoTicket>,
    )
}
