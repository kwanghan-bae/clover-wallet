package com.wallet.clover.entity.community

import com.wallet.clover.entity.BaseEntity
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table

@Entity
@Table(name = "comments")
class CommentEntity(
    val postId: Long,
    val userId: Long,
    var content: String,
) : BaseEntity() {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", insertable = false, updatable = false)
    lateinit var post: PostEntity
}

