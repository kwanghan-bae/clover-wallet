package com.wallet.clover.api.dto

import com.wallet.clover.api.entity.user.UserEntity
import java.time.LocalDateTime

data class UserResponse(
    val id: Long,
    val locale: String,
    val age: Int,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime
)

data class UpdateUserRequest(
    val locale: String?,
    val age: Int?
)

fun UserEntity.toResponse() = UserResponse(
    id = this.id!!,
    locale = this.locale,
    age = this.age,
    createdAt = this.createdAt,
    updatedAt = this.updatedAt
)
