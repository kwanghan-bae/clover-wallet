package com.wallet.clover.api.dto

import com.wallet.clover.api.entity.notification.NotificationEntity
import java.time.LocalDateTime

data class NotificationResponse(
    val id: Long,
    val title: String,
    val message: String,
    val isRead: Boolean,
    val type: String,
    val createdAt: LocalDateTime
) {
    companion object {
        fun from(entity: NotificationEntity): NotificationResponse {
            return NotificationResponse(
                id = entity.id!!,
                title = entity.title,
                message = entity.message,
                isRead = entity.isRead,
                type = entity.type,
                createdAt = entity.createdAt
            )
        }
    }
}
