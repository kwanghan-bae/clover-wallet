package com.wallet.clover.entity.community

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

