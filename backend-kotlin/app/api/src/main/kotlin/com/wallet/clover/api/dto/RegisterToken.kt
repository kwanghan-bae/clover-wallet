package com.wallet.clover.api.dto

abstract class RegisterToken {
    data class Request(
        /** FCM 토큰 */
        val token: String
    )

    data class Response(
        /** 등록 성공 여부 */
        val success: Boolean
    )
}
