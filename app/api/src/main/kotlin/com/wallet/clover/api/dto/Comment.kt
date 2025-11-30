package com.wallet.clover.api.dto

import com.wallet.clover.api.entity.community.CommentEntity
import java.time.LocalDateTime

abstract class Comment {
    data class Response(
        /** 댓글 ID */
        val id: Long,
        /** 게시글 ID */
        val postId: Long,
        /** 작성자 정보 */
        val user: UserSummary?,
        /** 댓글 내용 */
        val content: String,
        /** 생성 일시 */
        val createdAt: LocalDateTime,
        /** 수정 일시 */
        val updatedAt: LocalDateTime
    )
}

fun CommentEntity.toResponse(user: UserSummary?) = Comment.Response(
    id = this.id ?: throw IllegalStateException("Comment ID must not be null"),
    postId = this.postId,
    user = user,
    content = this.content,
    createdAt = this.createdAt,
    updatedAt = this.updatedAt
)
