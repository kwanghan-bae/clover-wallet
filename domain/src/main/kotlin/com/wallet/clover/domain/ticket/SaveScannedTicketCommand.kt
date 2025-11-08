package com.wallet.clover.domain.ticket

data class SaveScannedTicketCommand(
    val userId: Long,
    val url: String,
)
