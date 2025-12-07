package com.wallet.clover.api.scheduler

import com.wallet.clover.api.service.FcmService
import com.wallet.clover.api.service.UserService
import kotlinx.coroutines.flow.toList
import kotlinx.coroutines.runBlocking
import org.slf4j.LoggerFactory
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component

@Component
class NotificationScheduler(
    private val userService: UserService,
    private val fcmService: FcmService
) {
    private val logger = LoggerFactory.getLogger(javaClass)

    /**
     * 매주 토요일 저녁 8시에 로또 추첨 전 알림 발송
     * Cron: 0 0 20 * * SAT (초 분 시 일 월 요일)
     */
    @Scheduled(cron = "0 0 20 * * SAT", zone = "Asia/Seoul")
    fun sendWeeklyDrawReminder() = runBlocking {
        logger.info("주간 로또 추첨 알림 발송 시작...")
        
        try {
            // FCM 토큰이 있는 모든 활성 사용자 조회
            val fcmTokens = userService.getAllFcmTokens().toList()
            
            if (fcmTokens.isEmpty()) {
                logger.warn("알림을 발송할 FCM 토큰이 없습니다.")
                return@runBlocking
            }
            
            logger.info("${fcmTokens.size}명의 사용자에게 추첨 알림 발송")
            
            fcmService.sendBroadcastNotification(
                tokens = fcmTokens,
                title = "🍀 로또 추첨 안내",
                body = "오늘 밤 로또 추첨이 있습니다! 행운을 빕니다!"
            )
            
            logger.info("주간 로또 추첨 알림 발송 완료")
        } catch (e: Exception) {
            logger.error("주간 로또 추첨 알림 발송 실패", e)
        }
    }
}
