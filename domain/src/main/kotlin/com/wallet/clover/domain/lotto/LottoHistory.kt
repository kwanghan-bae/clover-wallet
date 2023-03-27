package com.wallet.clover.domain.lotto

import java.time.LocalDate

data class LottoHistory(
    val number1: Int,
    val number2: Int,
    val number3: Int,
    val number4: Int,
    val number5: Int,
    val number6: Int,
    val bonusNumber: Int,
    val totalRevenue: Long,
    val countOfFirstWinners: Int,
    val moneyOfFirstWinner: Long,
    val gameNumber: Int,
    val drawDate: LocalDate,
)
