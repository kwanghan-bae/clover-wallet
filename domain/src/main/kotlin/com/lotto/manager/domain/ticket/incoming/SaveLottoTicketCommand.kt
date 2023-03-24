package com.lotto.manager.domain.ticket.incoming

data class SaveLottoTicketCommand(
    val userId: Long,
    val qrCode: String
)
