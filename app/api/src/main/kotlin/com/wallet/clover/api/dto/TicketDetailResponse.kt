package com.wallet.clover.api.dto

data class TicketDetailResponse(
    val ticket: LottoTicketResponse,
    val games: List<LottoGameResponse>
)
