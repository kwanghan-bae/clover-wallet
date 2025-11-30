package com.wallet.clover.api.dto

import kotlin.collections.List

abstract class CheckWinning {
    data class Response(
        /** 결과 메시지 */
        val message: String,
        /** 당첨 번호 목록 */
        val winningNumbers: List<Int>? = null,
        /** 사용자 당첨 티켓 목록 */
        val userWinningTickets: List<UserWinningTicket>? = null,
    )

    data class UserWinningTicket(
        /** 회차 */
        val round: Int,
        /** 사용자 번호 목록 */
        val userNumbers: List<Int>,
        /** 일치 번호 목록 */
        val matchedNumbers: List<Int>,
        /** 등수 */
        val rank: String,
    )
}
