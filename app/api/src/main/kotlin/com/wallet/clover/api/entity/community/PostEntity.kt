package com.wallet.clover.api.entity.community

import org.springframework.data.annotation.Id
import org.springframework.data.relational.core.mapping.Table
import java.time.LocalDateTime

@Table("post")
data class PostEntity(
    @Id val id: Long? = null,
    val userId: Long,
    val title: String,
    val content: String,
    val likes: Int = 0,
    val createdAt: LocalDateTime = LocalDateTime.now(),
    val updatedAt: LocalDateTime = LocalDateTime.now()
)
