package com.wallet.clover.api.dto

import com.wallet.clover.api.entity.user.UserEntity
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

fun UserEntity.toResponse() = User.Response(
    id = this.id ?: throw IllegalStateException("User ID must not be null"),
    locale = this.locale,
    age = this.age,
    badges = this.badges?.split(",")?.filter { it.isNotBlank() } ?: emptyList(),
    createdAt = (this.createdAt ?: LocalDateTime.now()).withNano(0),
    updatedAt = (this.updatedAt ?: LocalDateTime.now()).withNano(0)
)
