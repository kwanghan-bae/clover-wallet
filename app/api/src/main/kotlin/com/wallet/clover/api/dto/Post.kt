package com.wallet.clover.api.dto

import com.wallet.clover.api.entity.community.PostEntity
import java.time.LocalDateTime

abstract class Post {
    data class Response(
        /** 게시글 ID */
        val id: Long,
        /** 작성자 정보 */
        val user: UserSummary?,
        /** 게시글 내용 */
        val content: String,
        /** 조회수 */
        val viewCount: Int,
        /** 좋아요 수 */
        val likeCount: Int,
        /** 생성 일시 */
        val createdAt: LocalDateTime,
        /** 수정 일시 */
        val updatedAt: LocalDateTime
    )
}

fun PostEntity.toResponse(user: UserSummary?) = Post.Response(
    id = this.id ?: throw IllegalStateException("Post ID must not be null"),
    user = user,
    content = this.content,
    viewCount = this.viewCount,
    likeCount = this.likeCount,
    createdAt = this.createdAt,
    updatedAt = this.updatedAt
)
