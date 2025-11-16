package com.wallet.clover.entity.community

import com.wallet.clover.domain.community.Post
import com.wallet.clover.entity.BaseEntity
import jakarta.persistence.Entity
import jakarta.persistence.Table

@Entity
@Table(name = "posts")
class PostEntity(
    val userId: Long,
    var title: String,
    var content: String,
) : BaseEntity()

fun PostEntity.toDomain(): Post = Post(
    id = this.id,
    userId = this.userId,
    title = this.title,
    content = this.content,
    createdAt = this.createdAt,
    updatedAt = this.updatedAt,
)

fun Post.toEntity(): PostEntity {
    val domainId = this.id
    return PostEntity(
        userId = this.userId,
        title = this.title,
        content = this.content,
    ).apply {
        id = domainId
    }
}
