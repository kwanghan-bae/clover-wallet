package com.wallet.clover.api.dto

import com.wallet.clover.api.entity.user.UserEntity
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.Size
import java.time.LocalDateTime

abstract class User {
    data class Response(
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
}

abstract class UpdateUser {
    data class Request(
        /** 로케일 */
        @field:Size(min = 2, max = 10, message = "Locale must be between 2 and 10 characters")
        val locale: String?,
        /** 나이 */
        @field:Min(value = 0, message = "Age must be non-negative")
        val age: Int?
    )
}

abstract class UserStats {
    data class Response(
        /** 총 게임 수 */
        val totalGames: Int,
        /** 총 당첨금 */
        val totalWinnings: Long,
        /** 총 사용 금액 */
        val totalSpent: Long,
        /** 수익률 (%) */
        val roi: Int
    )
}

abstract class Login {
    data class Response(
        /** 사용자 ID */
        val userId: Long,
        /** SSO 식별자 */
        val ssoQualifier: String,
        /** 로케일 */
        val locale: String
    )
}

fun UserEntity.toResponse() = User.Response(
    id = this.id ?: throw IllegalStateException("User ID must not be null"),
    locale = this.locale,
    age = this.age,
    badges = this.badges?.split(",")?.filter { it.isNotBlank() } ?: emptyList(),
    createdAt = (this.createdAt ?: LocalDateTime.now()).withNano(0),
    updatedAt = (this.updatedAt ?: LocalDateTime.now()).withNano(0)
)
