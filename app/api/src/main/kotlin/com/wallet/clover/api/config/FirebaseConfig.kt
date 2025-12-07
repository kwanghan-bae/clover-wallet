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
) {
    private val logger = LoggerFactory.getLogger(javaClass)

    @PostConstruct
    fun initializeFirebaseApp() {
        if (serviceAccountKeyPath.isBlank()) {
            logger.warn("Firebase 서비스 계정 키 경로가 비어 있습니다. Firebase 초기화를 건너뜁니다.")
            return
        }

        if (FirebaseApp.getApps().isEmpty()) {
            try {
                val options = FirebaseOptions.builder()
                    .setCredentials(
                        GoogleCredentials.fromStream(
                            FileInputStream(
                                serviceAccountKeyPath
                            )
                        ))
                    .build()

                FirebaseApp.initializeApp(options)
                logger.info("Firebase Admin SDK 초기화 성공.")
            } catch (e: IOException) {
                logger.error("Firebase Admin SDK 초기화 오류: {}", e.message)
                // 애플리케이션 요구사항에 따라 예외를 던지거나
                // FCM 기능을 비활성화하는 등 더 우아하게 처리할 수 있습니다.
            }
        } else {
            logger.info("Firebase Admin SDK가 이미 초기화되었습니다.")
        }
    }
}
