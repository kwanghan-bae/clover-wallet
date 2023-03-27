package com.wallet.clover.domain.ticket

import java.time.LocalDateTime

data class LottoTicket(
    val id: Long = 0,
    val userId: Long,
    val url: String,
    val ordinal: Int,
    val status: LottoTicketStatus,
    val createdAt: LocalDateTime = LocalDateTime.now(),
    val updatedAt: LocalDateTime = LocalDateTime.now(),
)
