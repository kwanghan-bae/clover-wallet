package com.wallet.clover.api.endpoint

object LottoCheck {
    data class Out(
        val message: String,
        val winningNumbers: List<Int>? = null,
        val userWinningTickets: List<UserWinningTicket>? = null
    )

    data class UserWinningTicket(
        val round: Int,
        val userNumbers: List<Int>,
        val matchedNumbers: List<Int>,
        val rank: String
    )
}
