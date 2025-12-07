package com.wallet.clover.api.controller

import com.wallet.clover.api.common.CommonResponse
import com.wallet.clover.api.common.PageResponse
import com.wallet.clover.api.dto.NotificationResponse
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
    ): CommonResponse<PageResponse<NotificationResponse>> {
        val notificationsPage = notificationService.getMyNotifications(userId, page, size)
        val responsePage = PageResponse(
            content = notificationsPage.content.map { NotificationResponse.from(it) },
            page = notificationsPage.page,
            size = notificationsPage.size,
            totalElements = notificationsPage.totalElements,
            totalPages = notificationsPage.totalPages
        )
        return CommonResponse.success(responsePage)
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
}
