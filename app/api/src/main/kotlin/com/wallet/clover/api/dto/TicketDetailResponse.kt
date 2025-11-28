package com.wallet.clover.api.dto

import com.wallet.clover.api.entity.game.LottoGameEntity
import com.wallet.clover.api.entity.ticket.LottoTicketEntity

data class TicketDetailResponse(
    val ticket: LottoTicketEntity,
    val games: List<LottoGameEntity>
)
