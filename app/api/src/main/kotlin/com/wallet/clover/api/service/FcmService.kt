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
            logger.info("Registering FCM token for user ${user.id}: $token")
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
            logger.warn("Firebase not initialized. Skipping FCM notification.")
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
                logger.info("Successfully sent message to user: {}", response)
            } catch (e: Exception) {
                logger.error("Error sending FCM notification to token: $token", e)
                // 에러가 발생해도 계속 진행 (non-blocking)
            }
        }
    }

    /**
     * 로또 당첨 알림 전송
     */
    suspend fun sendWinningNotification(token: String, rank: String, numbers: List<Int>) {
        val title = "🎉 로또 당첨!"
        val body = "$rank 당첨! 번호: ${numbers.sorted().joinToString(", ")}"
        sendToUser(token, title, body)
    }
}
