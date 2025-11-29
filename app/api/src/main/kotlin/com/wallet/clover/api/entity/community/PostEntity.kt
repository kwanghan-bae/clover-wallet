package com.wallet.clover.api.entity.community

import org.springframework.data.annotation.CreatedDate
import org.springframework.data.annotation.Id
import org.springframework.data.annotation.LastModifiedDate
import org.springframework.data.relational.core.mapping.Table
import java.time.LocalDateTime

@Table("post")
data class PostEntity(
    @Id val id: Long? = null,
    val userId: Long,
    val title: String,
    val content: String,
    val likes: Int = 0,
    @CreatedDate val createdAt: LocalDateTime? = null,
    @LastModifiedDate val updatedAt: LocalDateTime? = null
)
