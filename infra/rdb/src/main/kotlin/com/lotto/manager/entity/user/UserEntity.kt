package com.lotto.manager.entity.user

import com.lotto.manager.entity.BaseEntity
import jakarta.persistence.Table

@Table(name = "user")
data class UserEntity(
    val a: String
) : BaseEntity()
