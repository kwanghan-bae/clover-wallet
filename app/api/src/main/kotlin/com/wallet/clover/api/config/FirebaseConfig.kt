package com.wallet.clover.api.config

import com.google.auth.oauth2.GoogleCredentials
import com.google.firebase.FirebaseApp
import com.google.firebase.FirebaseOptions
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Configuration
import java.io.FileInputStream
import java.io.IOException
import javax.annotation.PostConstruct

@Configuration
class FirebaseConfig(
    @Value("\${firebase.service-account-key-path:}")
    private val serviceAccountKeyPath: String,
    @Value("\${firebase.service-account-json:}")
    private val serviceAccountJson: String
) {
    private val logger = LoggerFactory.getLogger(javaClass)

    @PostConstruct
    fun initializeFirebaseApp() {
        if (FirebaseApp.getApps().isNotEmpty()) {
            logger.info("Firebase Admin SDK가 이미 초기화되었습니다.")
            return
        }

        try {
            val optionsBuilder = FirebaseOptions.builder()

            if (serviceAccountJson.isNotBlank()) {
                // 1. JSON Content from Env Var (Priority)
                // Remove potential quotes if added by shell environment
                val jsonStream = serviceAccountJson.trim().removeSurrounding("\"").byteInputStream()
                optionsBuilder.setCredentials(GoogleCredentials.fromStream(jsonStream))
                logger.info("Firebase Credential loaded from JSON String (Environment Variable).")
            } else if (serviceAccountKeyPath.isNotBlank()) {
                // 2. File Path
                optionsBuilder.setCredentials(GoogleCredentials.fromStream(FileInputStream(serviceAccountKeyPath)))
                logger.info("Firebase Credential loaded from File Path.")
            } else {
                logger.warn("Firebase credentials not found (JSON or Path). Skipping initialization.")
                return
            }

            FirebaseApp.initializeApp(optionsBuilder.build())
            logger.info("Firebase Admin SDK 초기화 성공.")
        } catch (e: Exception) {
            logger.error("Firebase Admin SDK 초기화 오류: {}", e.message)
        }
    }
}
