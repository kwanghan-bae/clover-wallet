package com.wallet.clover.api.scheduler

import com.wallet.clover.api.repository.user.UserRepository
import com.wallet.clover.api.service.FcmService
import kotlinx.coroutines.flow.toList
import kotlinx.coroutines.runBlocking
import org.slf4j.LoggerFactory
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component

@Component
class NotificationScheduler(
    private val userRepository: UserRepository,
    private val fcmService: FcmService
) {
    private val logger = LoggerFactory.getLogger(javaClass)

    /**
     * 매주 토요일 저녁 8시에 로또 추첨 전 알림 발송
     * Cron: 0 0 20 * * SAT (초 분 시 일 월 요일)
     */
    @Scheduled(cron = "0 0 20 * * SAT", zone = "Asia/Seoul")
    fun sendWeeklyDrawReminder() = runBlocking {
        logger.info("Starting weekly draw reminder notification...")
        
        try {
            // FCM 토큰이 있는 모든 활성 사용자 조회
            val users = userRepository.findAll().toList()
            val fcmTokens = users.mapNotNull { it.fcmToken }.filter { it.isNotBlank() }
            
            if (fcmTokens.isEmpty()) {
                logger.warn("No FCM tokens found for notification")
                return@runBlocking
            }
            
            logger.info("Sending draw reminder to ${fcmTokens.size} users")
            
            fcmService.sendBroadcastNotification(
                tokens = fcmTokens,
                title = "🍀 로또 추첨 안내",
                body = "오늘 밤 로또 추첨이 있습니다! 행운을 빕니다!"
            )
            
            logger.info("Weekly draw reminder sent successfully")
        } catch (e: Exception) {
            logger.error("Failed to send weekly draw reminder", e)
        }
    }
}
