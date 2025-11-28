package com.wallet.clover.dto

data class LoginResponse(
    val userId: Long,
    val ssoQualifier: String,
    val locale: String
)
