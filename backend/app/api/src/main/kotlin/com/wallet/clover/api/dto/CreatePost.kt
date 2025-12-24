package com.wallet.clover.api.dto

import com.wallet.clover.api.entity.community.PostEntity
import jakarta.validation.constraints.NotBlank

abstract class CreatePost {
    data class Request(
        /** 게시글 내용 */
        @field:NotBlank(message = "Content cannot be blank")
        val content: String
    )
}

fun CreatePost.Request.toEntity(userId: Long) = PostEntity(
    userId = userId,
    content = this.content
)
