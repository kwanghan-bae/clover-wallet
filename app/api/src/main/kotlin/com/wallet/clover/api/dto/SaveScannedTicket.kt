package com.wallet.clover.api.dto

import com.wallet.clover.api.domain.extraction.ExtractionMethod

abstract class SaveScannedTicket {
    data class Command(
        /** 사용자 ID */
        val userId: Long,
        /** 티켓 이미지 URL */
        val url: String,
        /** 추출 방법 */
        val extractionMethod: ExtractionMethod? = null
    )
}
