package com.wallet.clover.api.service

import com.wallet.clover.api.entity.notification.NotificationEntity
import com.wallet.clover.api.repository.notification.NotificationRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.toList
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.stereotype.Service

@Service
class NotificationService(
    private val notificationRepository: NotificationRepository
) {
    suspend fun createNotification(userId: Long, title: String, message: String, type: String = "INFO"): NotificationEntity {
        return notificationRepository.save(
            NotificationEntity(
                userId = userId,
                title = title,
                message = message,
                type = type
            )
        )
    }

    suspend fun getMyNotifications(userId: Long, page: Int = 0, size: Int = 20): List<NotificationEntity> {
        val pageable = PageRequest.of(page, size, Sort.by("createdAt").descending())
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable).toList()
    }

    suspend fun markAsRead(notificationId: Long, userId: Long) {
        val notification = notificationRepository.findById(notificationId)
        if (notification != null && notification.userId == userId) {
            notificationRepository.save(notification.copy(isRead = true))
        }
    }

    suspend fun getUnreadCount(userId: Long): Long {
        return notificationRepository.countByUserIdAndIsReadFalse(userId)
    }
}
