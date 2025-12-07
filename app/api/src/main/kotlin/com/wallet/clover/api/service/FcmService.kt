package com.wallet.clover.api.service

import com.google.firebase.FirebaseApp
import com.google.firebase.messaging.FirebaseMessaging
import com.google.firebase.messaging.Message
import com.google.firebase.messaging.Notification
import com.wallet.clover.api.repository.user.UserRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class FcmService(
    private val userRepository: UserRepository
) {
    private val logger = LoggerFactory.getLogger(javaClass)

    @Transactional
    suspend fun registerToken(ssoQualifier: String, token: String) {
        val user = userRepository.findBySsoQualifier(ssoQualifier)
        if (user != null) {
            userRepository.save(user.copy(fcmToken = token))
            logger.info("사용자 ${user.id}의 FCM 토큰 등록: $token")
        }
    }

    /**
     * 특정 사용자에게 푸시 알림 전송
     * @param token FCM 디바이스 토큰
     * @param title 알림 제목
     * @param body 알림 본문
     */
    suspend fun sendToUser(token: String, title: String, body: String) {
        if (FirebaseApp.getApps().isEmpty()) {
            logger.warn("Firebase가 초기화되지 않았습니다. FCM 알림을 건너뜁니다.")
            return
        }

        withContext(Dispatchers.IO) {
            try {
                val notification = Notification.builder()
                    .setTitle(title)
                    .setBody(body)
                    .build()

                val message = Message.builder()
                    .setToken(token)
                    .setNotification(notification)
                    .build()

                val response = FirebaseMessaging.getInstance().send(message)
                logger.info("사용자에게 메시지 전송 성공: {}", response)
            } catch (e: Exception) {
                logger.error("토큰으로 FCM 알림 전송 오류: $token", e)
                // 에러가 발생해도 계속 진행 (non-blocking)
            }
        }
    }

    /**
     * 로또 당첨 알림 전송
     */
    suspend fun sendWinningNotification(token: String, rank: String, numbers: List<Int>, amount: Long? = null) {
        val title = "🎉 로또 당첨!"
        val amountText = amount?.let { " (당첨금: ${it}원)" } ?: ""
        val body = "$rank 당첨!$amountText 번호: ${numbers.sorted().joinToString(", ")}"
        
        if (FirebaseApp.getApps().isEmpty()) {
            logger.warn("Firebase가 초기화되지 않았습니다. FCM 당첨 알림을 건너뜁니다.")
            return
        }

        withContext(Dispatchers.IO) {
            try {
                val notification = Notification.builder()
                    .setTitle(title)
                    .setBody(body)
                    .build()

                val message = Message.builder()
                    .setToken(token)
                    .setNotification(notification)
                    .putData("type", "WINNING")         // 알림 타입
                    .putData("screen", "history")       // 이동할 화면
                    .putData("rank", rank)              // 당첨 등급
                    .build()

                FirebaseMessaging.getInstance().send(message)
                logger.info("사용자에게 당첨 알림 전송: $title - $body")
            } catch (e: Exception) {
                logger.error("당첨 알림 전송 오류", e)
            }
        }
    }

    /**
     * 다수의 사용자에게 동일한 알림 브로드캐스트
     * @param tokens FCM 디바이스 토큰 리스트
     * @param title 알림 제목
     * @param body 알림 본문
     */
    suspend fun sendBroadcastNotification(tokens: List<String>, title: String, body: String) {
        if (FirebaseApp.getApps().isEmpty()) {
            logger.warn("Firebase가 초기화되지 않았습니다. FCM 브로드캐스트 알림을 건너뜁니다.")
            return
        }

        withContext(Dispatchers.IO) {
            var successCount = 0
            var failureCount = 0

            tokens.forEach { token ->
                try {
                    val notification = Notification.builder()
                        .setTitle(title)
                        .setBody(body)
                        .build()

                    val message = Message.builder()
                        .setToken(token)
                        .setNotification(notification)
                        .putData("type", "DRAW_REMINDER")      // 알림 타입
                        .putData("screen", "number_generation") // 이동할 화면
                        .build()

                    FirebaseMessaging.getInstance().send(message)
                    successCount++
                } catch (e: Exception) {
                    logger.error("토큰으로 FCM 전송 오류: $token", e)
                    failureCount++
                }
            }

            logger.info("브로드캐스트 알림 전송: 성공 $successCount, 실패 $failureCount")
        }
    }
}
