package com.wallet.clover.api.dto

data class UserSummary(
    /** 사용자 ID */
    val id: Long,
    /** 닉네임 */
    val nickname: String,
    /** 뱃지 목록 */
    val badges: List<String>
)
