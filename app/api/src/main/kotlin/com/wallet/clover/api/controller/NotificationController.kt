package com.wallet.clover.api.controller

import com.wallet.clover.api.common.CommonResponse
import com.wallet.clover.api.entity.notification.NotificationEntity
import com.wallet.clover.api.service.NotificationService
import org.springframework.web.bind.annotation.*
import java.time.LocalDateTime

@RestController
@RequestMapping("/api/v1/notifications")
class NotificationController(
    private val notificationService: NotificationService
) {

    @GetMapping
    suspend fun getMyNotifications(
        @RequestParam userId: Long,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int
    ): CommonResponse<List<NotificationResponse>> {
        val notifications = notificationService.getMyNotifications(userId, page, size)
        return CommonResponse.success(notifications.map { NotificationResponse.from(it) })
    }

    @PutMapping("/{id}/read")
    suspend fun markAsRead(
        @PathVariable id: Long,
        @RequestParam userId: Long
    ): CommonResponse<Unit> {
        notificationService.markAsRead(id, userId)
        return CommonResponse.success(Unit)
    }
    
    @GetMapping("/unread-count")
    suspend fun getUnreadCount(@RequestParam userId: Long): CommonResponse<Long> {
        return CommonResponse.success(notificationService.getUnreadCount(userId))
    }

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
}
