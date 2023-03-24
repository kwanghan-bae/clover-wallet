package com.lotto.manager.domain.ticket

import java.time.LocalDateTime

data class LottoTicket(
    val id: Long = 0,
    val userId: Long,
    val url: String,
    val status: LottoTicketStatus,
    val createdAt: LocalDateTime = LocalDateTime.now(),
    val updatedAt: LocalDateTime = LocalDateTime.now()
)