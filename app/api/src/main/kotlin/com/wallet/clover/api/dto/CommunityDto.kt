package com.wallet.clover.api.dto

import com.wallet.clover.api.entity.community.CommentEntity
import com.wallet.clover.api.entity.community.PostEntity
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import java.time.LocalDateTime

// Post DTOs
// Post DTOs
data class PostResponse(
    /** 게시글 ID */
    val id: Long,
    /** 작성자 ID */
    val userId: Long,
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

data class CreatePostRequest(
    @field:NotBlank(message = "Content cannot be blank")
    val content: String
)

data class UpdatePostRequest(
    val content: String?
)

// Comment DTOs
data class CommentResponse(
    /** 댓글 ID */
    val id: Long,
    /** 게시글 ID */
    val postId: Long,
    /** 작성자 ID */
    val userId: Long,
    /** 댓글 내용 */
    val content: String,
    /** 생성 일시 */
    val createdAt: LocalDateTime,
    /** 수정 일시 */
    val updatedAt: LocalDateTime
)

data class CreateCommentRequest(
    val postId: Long,
    @field:NotBlank(message = "Content cannot be blank")
    val content: String
)

data class UpdateCommentRequest(
    @field:NotBlank(message = "Content cannot be blank")
    val content: String?
)

// Mapper functions for Post
fun PostEntity.toResponse() = PostResponse(
    id = this.id ?: throw IllegalStateException("Post ID must not be null"),
    userId = this.userId,
    content = this.content,
    viewCount = this.viewCount,
    likeCount = this.likeCount,
    createdAt = this.createdAt,
    updatedAt = this.updatedAt
)

fun CreatePostRequest.toEntity(userId: Long) = PostEntity(
    userId = userId,
    content = this.content
)

// Mapper functions for Comment
fun CommentEntity.toResponse() = CommentResponse(
    id = this.id ?: throw IllegalStateException("Comment ID must not be null"),
    postId = this.postId,
    userId = this.userId,
    content = this.content,
    createdAt = this.createdAt,
    updatedAt = this.updatedAt
)

fun CreateCommentRequest.toEntity(userId: Long) = CommentEntity(
    postId = this.postId,
    userId = userId,
    content = this.content
)
