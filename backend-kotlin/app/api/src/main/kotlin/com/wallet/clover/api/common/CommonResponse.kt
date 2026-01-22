package com.wallet.clover.api.common

import java.time.LocalDateTime

data class CommonResponse<T>(
    val success: Boolean,
    val data: T?,
    val message: String? = null,
    val timestamp: LocalDateTime = LocalDateTime.now()
) {
    companion object {
        fun <T> success(data: T): CommonResponse<T> {
            return CommonResponse(true, data)
        }

        fun <T> fail(message: String): CommonResponse<T> {
            return CommonResponse(false, null, message)
        }
    }
}
