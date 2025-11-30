package com.wallet.clover.api.dto

import jakarta.validation.constraints.NotBlank

abstract class UpdateComment {
    data class Request(
        /** 댓글 내용 */
        @field:NotBlank(message = "Content cannot be blank")
        val content: String?
    )
}
