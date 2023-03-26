package com.lotto.manager.internal.endpoint

import com.fasterxml.jackson.annotation.JsonUnwrapped
import com.lotto.manager.domain.game.LottoGame
import com.lotto.manager.domain.ticket.LottoTicket

interface TicketSpec {
    fun add(input: Add.In): Add.Out

    fun list(input: List.In): List.Out

    fun detail(ticketId: Long): Detail.Out

    object Detail {

        data class Out(
            @JsonUnwrapped
            val ticket: LottoTicket,
            val games: kotlin.collections.List<LottoGame>
        )
    }

    object Add {
        data class In(
            val qrCode: String,
            val userId: Long
        )

        data class Out(
            val status: String,
            val message: String
        ) {
            companion object {
                fun success() = Out(
                    status = "success",
                    message = "good"
                )
            }
        }
    }

    object List {
        data class In(
            val userId: Long
        )

        data class Out(
            val tickets: kotlin.collections.List<LottoTicket>
        )
    }
}
