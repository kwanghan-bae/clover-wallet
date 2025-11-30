package com.wallet.clover.api.dto

import com.wallet.clover.api.entity.user.UserEntity
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.Size
import java.time.LocalDateTime

data class UserResponse(
    /** 사용자 ID */
    val id: Long,
    /** 사용자 로케일 */
    val locale: String,
    /** 사용자 나이 */
    val age: Int,
    /** 획득한 뱃지 목록 */
    val badges: List<String> = emptyList(),
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime
)

data class UpdateUserRequest(
    @field:Size(min = 2, max = 10, message = "Locale must be between 2 and 10 characters")
    val locale: String?,
    @field:Min(value = 0, message = "Age must be non-negative")
    val age: Int?
)

data class UserStatsResponse(
    val totalGames: Int,
    val totalWinnings: Long,
    val totalSpent: Long,
    val roi: Int
)

fun UserEntity.toResponse() = UserResponse(
    id = this.id ?: throw IllegalStateException("User ID must not be null"),
    locale = this.locale,
    age = this.age,
    badges = this.badges?.split(",")?.filter { it.isNotBlank() } ?: emptyList(),
    createdAt = this.createdAt ?: LocalDateTime.now(),
    updatedAt = this.updatedAt ?: LocalDateTime.now()
)
