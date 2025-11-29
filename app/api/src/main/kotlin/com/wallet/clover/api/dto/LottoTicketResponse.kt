package com.wallet.clover.api.dto

import com.wallet.clover.api.entity.ticket.LottoTicketEntity
import com.wallet.clover.api.entity.ticket.LottoTicketStatus
import java.time.LocalDateTime

data class LottoTicketResponse(
    val id: Long,
    val url: String,
    val ordinal: Int,
    val status: LottoTicketStatus,
    val createdAt: LocalDateTime
) {
    companion object {
        fun from(entity: LottoTicketEntity): LottoTicketResponse {
            return LottoTicketResponse(
                id = entity.id!!,
                url = entity.url,
                ordinal = entity.ordinal,
                status = entity.status,
                createdAt = entity.createdAt
            )
        }
    }
}
