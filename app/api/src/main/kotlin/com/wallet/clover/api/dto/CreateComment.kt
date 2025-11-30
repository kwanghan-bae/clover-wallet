package com.wallet.clover.api.dto

import com.wallet.clover.api.entity.community.CommentEntity
import jakarta.validation.constraints.NotBlank

abstract class CreateComment {
    data class Request(
        /** 게시글 ID */
        val postId: Long,
        /** 댓글 내용 */
        @field:NotBlank(message = "Content cannot be blank")
        val content: String
    )
}

fun CreateComment.Request.toEntity(userId: Long) = CommentEntity(
    postId = this.postId,
    userId = userId,
    content = this.content
)
