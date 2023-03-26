package com.lotto.manager.internal.endpoint

import com.lotto.manager.domain.ticket.LottoTicket

interface TicketSpec {
    fun add(input: Add.In): Add.Out

    fun list(input: List.In): List.Out
    
    fun one()
    
    object One {
        data class In(
            val userId: Long,
            val ticketId: Long
        )
        
        data class Out(
            val ticket: LottoTicket
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
