package com.wallet.clover.entity.community

import com.wallet.clover.domain.community.Comment
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

fun CommentEntity.toDomain(): Comment = Comment(
    id = this.id,
    postId = this.postId,
    userId = this.userId,
    content = this.content,
    createdAt = this.createdAt,
    updatedAt = this.updatedAt,
)

fun Comment.toEntity(): CommentEntity {
    val domainId = this.id
    return CommentEntity(
        postId = this.postId,
        userId = this.userId,
        content = this.content,
    ).apply {
        id = domainId
    }
}
