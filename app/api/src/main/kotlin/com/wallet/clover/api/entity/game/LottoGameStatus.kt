package com.wallet.clover.api.entity.game

enum class LottoGameStatus {
    LOSING,
    WINNING_5,
    WINNING_4,
    WINNING_3,
    WINNING_2,
    WINNING_1,
    ;

    companion object {
        fun valueOfHtmlValue(htmlValue: String): LottoGameStatus {
            return when {
                (htmlValue == "1등당첨") -> WINNING_1
                (htmlValue == "2등당첨") -> WINNING_2
                (htmlValue == "3등당첨") -> WINNING_3
                (htmlValue == "4등당첨") -> WINNING_4
                (htmlValue == "5등당첨") -> WINNING_5
                else -> LOSING
            }
        }
    }
}
