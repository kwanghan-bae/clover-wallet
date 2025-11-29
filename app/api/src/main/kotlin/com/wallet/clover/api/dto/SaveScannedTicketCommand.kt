package com.wallet.clover.api.dto

import jakarta.validation.constraints.Pattern

data class SaveScannedTicketCommand(
    val userId: Long,
    @field:Pattern(
        regexp = "^https://dhlottery\\.co\\.kr/.*$",
        message = "URL must be a valid dhlottery.co.kr URL"
    )
    val url: String,
)
