package com.lotto.manager.domain.game

data class LottoGame(
    val id: Long = 0,
    val userId: Long,
    val ticketId: Long,
    val status: LottoGameStatus,
    val number1: Int,
    val number2: Int,
    val number3: Int,
    val number4: Int,
    val number5: Int,
    val number6: Int
)
