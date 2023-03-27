package com.wallet.clover.domain.ticket.incoming

data class SaveScannedTicketCommand(
    val userId: Long,
    val url: String,
)
