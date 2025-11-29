package com.wallet.clover.api.dto

import com.wallet.clover.api.entity.game.LottoGameEntity
import com.wallet.clover.api.entity.game.LottoGameStatus
import java.time.LocalDateTime

data class LottoGameResponse(
    val id: Long,
    val status: LottoGameStatus,
    val number1: Int,
    val number2: Int,
    val number3: Int,
    val number4: Int,
    val number5: Int,
    val number6: Int,
    val createdAt: LocalDateTime
) {
    companion object {
        fun from(entity: LottoGameEntity): LottoGameResponse {
            return LottoGameResponse(
                id = entity.id!!,
                status = entity.status,
                number1 = entity.number1,
                number2 = entity.number2,
                number3 = entity.number3,
                number4 = entity.number4,
                number5 = entity.number5,
                number6 = entity.number6,
                createdAt = entity.createdAt
            )
        }
    }
}
