package com.wallet.clover.api.dto

import com.wallet.clover.api.entity.user.UserEntity
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.Size
import java.time.LocalDateTime

data class UserResponse(
    val id: Long,
    val locale: String,
    val age: Int,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime
)

data class UpdateUserRequest(
    @field:Size(min = 2, max = 10, message = "Locale must be between 2 and 10 characters")
    val locale: String?,
    @field:Min(value = 0, message = "Age must be non-negative")
    val age: Int?
)

fun UserEntity.toResponse() = UserResponse(
    id = this.id ?: throw IllegalStateException("User ID must not be null"),
    locale = this.locale,
    age = this.age,
    createdAt = this.createdAt ?: LocalDateTime.now(),
    updatedAt = this.updatedAt ?: LocalDateTime.now()
)
