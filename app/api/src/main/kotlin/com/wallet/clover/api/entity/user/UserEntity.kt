package com.wallet.clover.api.entity.user

import org.springframework.data.annotation.CreatedDate
import org.springframework.data.annotation.Id
import org.springframework.data.annotation.LastModifiedDate
import org.springframework.data.relational.core.mapping.Table
import java.time.LocalDateTime

@Table("users")
data class UserEntity(
    @Id val id: Long? = null,
    val ssoQualifier: String,
    val locale: String,
    val age: Int,
    val fcmToken: String? = null,
    val badges: String? = null, // Comma-separated badge codes
    val createdAt: LocalDateTime? = null,
    val updatedAt: LocalDateTime? = null
)
