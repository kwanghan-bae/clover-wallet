package com.wallet.clover.entity.user

import com.wallet.clover.entity.BaseEntity
import jakarta.persistence.Table

@Table(name = "user")
data class UserEntity(
    val a: String,
) : BaseEntity()
