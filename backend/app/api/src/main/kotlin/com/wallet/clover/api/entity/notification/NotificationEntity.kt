package com.wallet.clover.api.entity.notification

import org.springframework.data.annotation.CreatedDate
import org.springframework.data.annotation.Id
import org.springframework.data.relational.core.mapping.Table
import java.time.LocalDateTime

@Table("notification")
data class NotificationEntity(
    @Id val id: Long? = null,
    val userId: Long,
    val title: String,
    val message: String,
    val isRead: Boolean = false,
    val type: String = "INFO", // INFO, WINNING, SYSTEM
    @CreatedDate
    val createdAt: LocalDateTime = LocalDateTime.now()
)
