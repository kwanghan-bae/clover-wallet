package com.wallet.clover.domain.community

import java.time.LocalDateTime

data class Post(
    val id: Long = 0,
    val userId: Long,
    val title: String,
    val content: String,
    val createdAt: LocalDateTime? = null,
    val updatedAt: LocalDateTime? = null,
)
