package com.wallet.clover.api.dto

import jakarta.validation.constraints.Pattern

data class SaveScannedTicketCommand(
    val userId: Long,
    @field:Pattern(
        regexp = "^https://dhlottery\\.co\\.kr/.*$",
        message = "URL must be a valid dhlottery.co.kr URL"
    )
    val url: String,
    val extractionMethod: String? = null,  // 사용자가 선택한 추출 방식
)
