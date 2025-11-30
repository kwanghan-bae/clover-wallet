package com.wallet.clover.api.dto

import com.wallet.clover.api.domain.extraction.ExtractionMethod
import com.wallet.clover.api.entity.game.LottoGameEntity
import com.wallet.clover.api.entity.game.LottoGameStatus

data class LottoGameRequest(
    val ticketId: Long,
    val userId: Long,
    val status: LottoGameStatus,
    val number1: Int,
    val number2: Int,
    val number3: Int,
    val number4: Int,
    val number5: Int,
    val number6: Int,
    val extractionMethod: ExtractionMethod? = null
) {
    fun toEntity(): LottoGameEntity {
        return LottoGameEntity(
            ticketId = ticketId,
            userId = userId,
            status = status,
            number1 = number1,
            number2 = number2,
            number3 = number3,
            number4 = number4,
            number5 = number5,
            number6 = number6,
            extractionMethod = extractionMethod
        )
    }
}
