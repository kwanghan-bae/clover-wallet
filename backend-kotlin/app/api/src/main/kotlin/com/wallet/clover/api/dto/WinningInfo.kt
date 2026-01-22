package com.wallet.clover.api.dto

import com.wallet.clover.api.entity.winning.WinningInfoEntity
import java.time.LocalDate

abstract class WinningInfo {
    data class Response(
        val round: Int,
        val drawDate: LocalDate,
        val numbers: List<Int>,
        val bonusNumber: Int,
        val firstPrizeAmount: Long,
        val secondPrizeAmount: Long,
        val thirdPrizeAmount: Long,
        val fourthPrizeAmount: Long,
        val fifthPrizeAmount: Long
    ) {
        companion object {
            fun from(entity: WinningInfoEntity): Response {
                return Response(
                    round = entity.round,
                    drawDate = entity.drawDate,
                    numbers = listOf(entity.number1, entity.number2, entity.number3, entity.number4, entity.number5, entity.number6),
                    bonusNumber = entity.bonusNumber,
                    firstPrizeAmount = entity.firstPrizeAmount,
                    secondPrizeAmount = entity.secondPrizeAmount,
                    thirdPrizeAmount = entity.thirdPrizeAmount,
                    fourthPrizeAmount = entity.fourthPrizeAmount,
                    fifthPrizeAmount = entity.fifthPrizeAmount
                )
            }
        }
    }
}
