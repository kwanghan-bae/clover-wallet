package com.wallet.clover.api.dto

import jakarta.validation.constraints.Min
import jakarta.validation.constraints.Size

abstract class UpdateUser {
    data class Request(
        /** 로케일 */
        @field:Size(min = 2, max = 10, message = "Locale must be between 2 and 10 characters")
        val locale: String?,
        /** 나이 */
        @field:Min(value = 0, message = "Age must be non-negative")
        val age: Int?
    )
}
