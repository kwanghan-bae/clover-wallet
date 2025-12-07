package com.wallet.clover.api.dto

data class RefreshRequest(
    val refreshToken: String
)

data class LogoutRequest(
    val refreshToken: String
)
