package com.wallet.clover.api.dto

data class SaveScannedTicketCommand(
    val userId: Long,
    val url: String,
)
