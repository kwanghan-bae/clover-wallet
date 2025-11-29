package com.wallet.clover.api.service

import org.springframework.stereotype.Component

@Component
class WinningChecker {

    data class WinningNumbers(
        val numbers: List<Int>,
        val bonusNumber: Int
    )

    enum class WinningRank(val prize: String) {
        FIRST("1등"),
        SECOND("2등"),
        THIRD("3등"),
        FOURTH("4등"),
        FIFTH("5등"),
        NONE("낙첨")
    }

    /**
     * 당첨 등수 계산
     * @param userNumbers 사용자가 선택한 번호 (6개)
     * @param winningNumbers 당첨 번호 정보
     * @return 당첨 등수
     */
    fun checkWinning(userNumbers: List<Int>, winningNumbers: WinningNumbers): WinningRank {
        val matchCount = userNumbers.count { it in winningNumbers.numbers }
        val hasBonus = winningNumbers.bonusNumber in userNumbers

        return when {
            matchCount == 6 -> WinningRank.FIRST
            matchCount == 5 && hasBonus -> WinningRank.SECOND
            matchCount == 5 -> WinningRank.THIRD
            matchCount == 4 -> WinningRank.FOURTH
            matchCount == 3 -> WinningRank.FIFTH
            else -> WinningRank.NONE
        }
    }

    /**
     * 당첨 메시지 생성
     */
    fun getWinningMessage(rank: WinningRank, userNumbers: List<Int>): String {
        return when (rank) {
            WinningRank.NONE -> "아쉽게도 낙첨입니다. 다음 기회에!"
            else -> "축하합니다! ${rank.prize}에 당첨되었습니다! 🎉\n당첨 번호: ${userNumbers.sorted().joinToString(", ")}"
        }
    }
}
