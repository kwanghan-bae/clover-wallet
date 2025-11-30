package com.wallet.clover.api.dto

abstract class Fcm {
    data class RegisterTokenRequest(val token: String)
    data class RegisterTokenResponse(val success: Boolean)
}
