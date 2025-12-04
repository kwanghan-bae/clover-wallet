package com.wallet.clover.api.entity.community

import org.springframework.data.annotation.CreatedDate
import org.springframework.data.annotation.Id
import org.springframework.data.relational.core.mapping.Table
import java.time.LocalDateTime

@Table("post_like")
data class PostLikeEntity(
    @Id val id: Long? = null,
    val userId: Long,
    val postId: Long,
    @CreatedDate
    val createdAt: LocalDateTime = LocalDateTime.now()
)
