package com.wallet.clover.api.dto

abstract class Login {
    data class Response(
        /** 사용자 ID */
        val userId: Long,
        /** SSO 식별자 */
        val ssoQualifier: String,
        /** 로케일 */
        val locale: String
    )
}
