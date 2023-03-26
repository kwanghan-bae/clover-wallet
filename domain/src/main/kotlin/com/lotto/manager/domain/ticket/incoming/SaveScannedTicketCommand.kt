package com.lotto.manager.domain.ticket.incoming

data class SaveScannedTicketCommand(
    val userId: Long,
    val url: String
)
