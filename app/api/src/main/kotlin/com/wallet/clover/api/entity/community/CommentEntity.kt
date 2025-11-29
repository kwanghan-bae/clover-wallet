package com.wallet.clover.api.entity.community

import org.springframework.data.annotation.CreatedDate
import org.springframework.data.annotation.Id
import org.springframework.data.annotation.LastModifiedDate
import org.springframework.data.relational.core.mapping.Table
import java.time.LocalDateTime

@Table("comment")
data class CommentEntity(
    @Id val id: Long? = null,
    val postId: Long,
    val userId: Long,
    val content: String,
    val likes: Int = 0,
    @CreatedDate val createdAt: LocalDateTime? = null,
    @LastModifiedDate val updatedAt: LocalDateTime? = null
)
