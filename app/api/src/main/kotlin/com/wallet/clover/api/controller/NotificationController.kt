package com.wallet.clover.api.controller

import com.wallet.clover.api.common.CommonResponse
import com.wallet.clover.api.common.PageResponse
import com.wallet.clover.api.dto.Notification
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
    ): CommonResponse<PageResponse<Notification.Response>> {
        val notifications = notificationService.getMyNotifications(userId, page, size)
        val response = PageResponse(
            content = notifications.content.map { Notification.Response.from(it) },
            page = notifications.page,
            size = notifications.size,
            totalElements = notifications.totalElements,
            totalPages = notifications.totalPages
        )
        return CommonResponse.success(response)
    }

    @PostMapping
    suspend fun createNotification(
        @RequestParam userId: Long,
        @RequestParam title: String,
        @RequestParam message: String
    ): CommonResponse<String> {
        notificationService.createNotification(userId, title, message)
        return CommonResponse.success("Notification created")
    }

    @PutMapping("/{notificationId}/read")
    suspend fun markAsRead(
        @PathVariable notificationId: Long,
        @RequestParam userId: Long
    ): CommonResponse<String> {
        notificationService.markAsRead(notificationId, userId)
        return CommonResponse.success("Notification marked as read")
    }

    @GetMapping("/unread-count")
    suspend fun getUnreadCount(@RequestParam userId: Long): CommonResponse<Long> {
        return CommonResponse.success(notificationService.getUnreadCount(userId))
    }
}
