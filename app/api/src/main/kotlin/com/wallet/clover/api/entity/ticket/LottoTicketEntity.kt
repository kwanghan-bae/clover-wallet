package com.wallet.clover.api.entity.ticket

import org.springframework.data.annotation.Id
import org.springframework.data.relational.core.mapping.Table
import java.time.LocalDateTime

@Table("lotto_ticket")
data class LottoTicketEntity(
    @Id val id: Long? = null,
    val userId: Long,
    val url: String,
    val ordinal: Int,
    val status: LottoTicketStatus,
    val createdAt: LocalDateTime = LocalDateTime.now(),
    val updatedAt: LocalDateTime = LocalDateTime.now()
)
