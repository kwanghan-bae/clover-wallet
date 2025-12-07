package com.wallet.clover.api.dto

import com.wallet.clover.api.entity.user.UserEntity

abstract class Auth {
    data class RefreshRequest(
        val refreshToken: String
    )

    data class LogoutRequest(
        val refreshToken: String
    )

    data class LoginResponse(
        val accessToken: String,
        val refreshToken: String,
        val user: UserEntity
    )

    data class RefreshResponse(
        val accessToken: String
    )
}
