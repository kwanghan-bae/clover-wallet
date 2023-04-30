package com.wallet.clover.entity.user

import com.wallet.clover.entity.BaseEntity
import jakarta.persistence.Entity
import jakarta.persistence.Table

@Entity
@Table(name = "users")
class UserEntity(
    val ssoQualifier: String? = null,
    val locale: String? = null,
    val age: Int? = null,
) : BaseEntity()
