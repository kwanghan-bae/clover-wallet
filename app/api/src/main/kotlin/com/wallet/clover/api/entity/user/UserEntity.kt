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
    val fcmToken: String? = null,  // FCM 푸시 알림 토큰
    val createdAt: LocalDateTime? = null,
    val updatedAt: LocalDateTime? = null
)
