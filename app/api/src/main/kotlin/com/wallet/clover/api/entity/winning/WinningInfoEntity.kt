package com.wallet.clover.api.entity.winning

import org.springframework.data.annotation.Id
import org.springframework.data.relational.core.mapping.Table
import java.time.LocalDate

@Table("winning_info")
data class WinningInfoEntity(
    @Id
    val id: Long? = null,
    val round: Int,
    val drawDate: LocalDate,
    val number1: Int,
    val number2: Int,
    val number3: Int,
    val number4: Int,
    val number5: Int,
    val number6: Int,
    val bonusNumber: Int,
    val firstPrizeAmount: Long, // 1등 당첨금 (1게임당)
    val secondPrizeAmount: Long, // 2등 당첨금
    val thirdPrizeAmount: Long, // 3등 당첨금
    val fourthPrizeAmount: Long, // 4등 당첨금 (보통 50,000)
    val fifthPrizeAmount: Long // 5등 당첨금 (보통 5,000)
)
