package com.wallet.clover.api.dto

import com.wallet.clover.api.entity.community.CommentEntity
import com.wallet.clover.api.entity.community.PostEntity
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import java.time.LocalDateTime

// Post DTOs
data class PostResponse(
    val id: Long,
    val userId: Long,
    val title: String,
    val content: String,
    val likes: Int,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime
)

data class CreatePostRequest(
    val userId: Long,
    @field:NotBlank(message = "Title cannot be blank")
    @field:Size(min = 1, max = 100, message = "Title must be between 1 and 100 characters")
    val title: String,
    @field:NotBlank(message = "Content cannot be blank")
    val content: String
)

data class UpdatePostRequest(
    @field:Size(min = 1, max = 100, message = "Title must be between 1 and 100 characters")
    val title: String?,
    val content: String?
)

// Comment DTOs
data class CommentResponse(
    val id: Long,
    val postId: Long,
    val userId: Long,
    val content: String,
    val likes: Int,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime
)

data class CreateCommentRequest(
    val postId: Long,
    val userId: Long,
    @field:NotBlank(message = "Content cannot be blank")
    val content: String
)

data class UpdateCommentRequest(
    @field:NotBlank(message = "Content cannot be blank")
    val content: String?
)

// Mapper functions for Post
fun PostEntity.toResponse() = PostResponse(
    id = this.id!!,
    userId = this.userId,
    title = this.title,
    content = this.content,
    likes = this.likes,
    createdAt = this.createdAt,
    updatedAt = this.updatedAt
)

fun CreatePostRequest.toEntity() = PostEntity(
    userId = this.userId,
    title = this.title,
    content = this.content
)

// Mapper functions for Comment
fun CommentEntity.toResponse() = CommentResponse(
    id = this.id!!,
    postId = this.postId,
    userId = this.userId,
    content = this.content,
    likes = this.likes,
    createdAt = this.createdAt,
    updatedAt = this.updatedAt
)

fun CreateCommentRequest.toEntity() = CommentEntity(
    postId = this.postId,
    userId = this.userId,
    content = this.content
)
