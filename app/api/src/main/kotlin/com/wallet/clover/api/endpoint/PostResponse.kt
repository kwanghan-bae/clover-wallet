package com.wallet.clover.api.endpoint

import java.time.LocalDateTime

data class PostResponse(
    val id: Long,
    val userId: Long,
    val title: String,
    val content: String,
    val createdAt: LocalDateTime?,
    val updatedAt: LocalDateTime?,
)
