package com.wallet.clover.domain.game

enum class LottoGameStatus {
    LOSING,
    WINNING_5,
    WINNING_4,
    WINNING_3,
    WINNING_2,
    WINNING_1,
    ;

    companion object {
        fun valueOfHtmlValue(htmlValue: String): com.wallet.clover.domain.game.LottoGameStatus {
            return when {
                (htmlValue == "1등당첨") -> com.wallet.clover.domain.game.LottoGameStatus.WINNING_1
                (htmlValue == "2등당첨") -> com.wallet.clover.domain.game.LottoGameStatus.WINNING_2
                (htmlValue == "3등당첨") -> com.wallet.clover.domain.game.LottoGameStatus.WINNING_3
                (htmlValue == "4등당첨") -> com.wallet.clover.domain.game.LottoGameStatus.WINNING_4
                (htmlValue == "5등당첨") -> com.wallet.clover.domain.game.LottoGameStatus.WINNING_5
                else -> com.wallet.clover.domain.game.LottoGameStatus.LOSING
            }
        }
    }
}
// form submit
// https://dhlottery.co.kr/store.do?method=topStore&pageGubun=L645
// method = topStore
// nowPage = $page
// rankNo = "" or null
// gameNo = 5133 // 고정값인듯
