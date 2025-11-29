package com.wallet.clover.api.service

import com.google.firebase.messaging.FirebaseMessaging
import com.google.firebase.messaging.Message
import com.google.firebase.messaging.Notification
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service

@Service
class NotificationService {
    private val logger = LoggerFactory.getLogger(javaClass)

    suspend fun sendWinningNotification(deviceToken: String, winningAmount: String) = withContext(Dispatchers.IO) {
        val message = Message.builder()
            .setToken(deviceToken)
            .setNotification(
                Notification.builder()
                    .setTitle("로또 당첨 알림!")
                    .setBody("축하합니다! ${winningAmount}에 당첨되셨습니다!")
                    .build(),
            )
            .putData("type", "lotto_winning")
            .putData("amount", winningAmount)
            .build()

        try {
            val response = FirebaseMessaging.getInstance().send(message)
            logger.info("Successfully sent message: {}", response)
        } catch (e: Exception) {
            logger.error("Error sending message: {}", e.message)
        }
    }
}
