package com.wallet.clover.api.dto

import com.wallet.clover.api.entity.community.CommentEntity
import com.wallet.clover.api.entity.community.PostEntity
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import java.time.LocalDateTime

data class UserSummary(
    /** 사용자 ID */
    val id: Long,
    /** 닉네임 */
    val nickname: String,
    /** 뱃지 목록 */
    val badges: List<String>
)

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

abstract class CreatePost {
    data class Request(
        /** 게시글 내용 */
        @field:NotBlank(message = "Content cannot be blank")
        val content: String
    )
}

abstract class UpdatePost {
    data class Request(
        /** 게시글 내용 */
        val content: String?
    )
}

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

abstract class CreateComment {
    data class Request(
        /** 게시글 ID */
        val postId: Long,
        /** 댓글 내용 */
        @field:NotBlank(message = "Content cannot be blank")
        val content: String
    )
}

abstract class UpdateComment {
    data class Request(
        /** 댓글 내용 */
        @field:NotBlank(message = "Content cannot be blank")
        val content: String?
    )
}

// Mapper functions for Post
fun PostEntity.toResponse(user: UserSummary?) = Post.Response(
    id = this.id ?: throw IllegalStateException("Post ID must not be null"),
    user = user,
    content = this.content,
    viewCount = this.viewCount,
    likeCount = this.likeCount,
    createdAt = this.createdAt,
    updatedAt = this.updatedAt
)

fun CreatePost.Request.toEntity(userId: Long) = PostEntity(
    userId = userId,
    content = this.content
)

// Mapper functions for Comment
fun CommentEntity.toResponse(user: UserSummary?) = Comment.Response(
    id = this.id ?: throw IllegalStateException("Comment ID must not be null"),
    postId = this.postId,
    user = user,
    content = this.content,
    createdAt = this.createdAt,
    updatedAt = this.updatedAt
)

fun CreateComment.Request.toEntity(userId: Long) = CommentEntity(
    postId = this.postId,
    userId = userId,
    content = this.content
)
