package com.wallet.clover.api.endpoint

import java.time.LocalDateTime

data class CommentResponse(
    val id: Long,
    val postId: Long,
    val userId: Long,
    val content: String,
    val createdAt: LocalDateTime?,
    val updatedAt: LocalDateTime?,
)
