package com.wallet.clover.domain.community

import java.time.LocalDateTime

data class Comment(
    val id: Long = 0,
    val postId: Long,
    val userId: Long,
    val content: String,
    val createdAt: LocalDateTime? = null,
    val updatedAt: LocalDateTime? = null,
)
