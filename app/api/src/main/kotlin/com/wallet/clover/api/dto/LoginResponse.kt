package com.wallet.clover.api.dto

data class LoginResponse(
    val userId: Long,
    val ssoQualifier: String,
    val locale: String
)
