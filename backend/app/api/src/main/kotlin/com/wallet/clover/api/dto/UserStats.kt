package com.wallet.clover.api.dto

abstract class UserStats {
    data class Response(
        /** 총 게임 수 */
        val totalGames: Int,
        /** 총 당첨금 */
        val totalWinnings: Long,
        /** 총 사용 금액 */
        val totalSpent: Long,
        /** 수익률 (%) */
        val roi: Int
    )
}
