package com.wallet.clover.entity.ticket

import com.wallet.clover.domain.ticket.LottoTicketStatus
import com.wallet.clover.entity.BaseEntity
import jakarta.persistence.Table

@Table(name = "lotto_ticket")
data class LottoTicketEntity(
    val userId: Long,
    val url: String,
    val ordinal: Int,
    val status: LottoTicketStatus,
) : BaseEntity()
