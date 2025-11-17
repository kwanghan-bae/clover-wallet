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
        if (FirebaseApp.getApps().isEmpty()) {
            try {
                val options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(FileInputStream(serviceAccountKeyPath)))
                    .build()

                FirebaseApp.initializeApp(options)
                logger.info("Firebase Admin SDK initialized successfully.")
            } catch (e: IOException) {
                logger.error("Error initializing Firebase Admin SDK: {}", e.message)
                // Depending on your application's needs, you might want to throw an exception
                // or handle this more gracefully, e.g., by disabling FCM features.
            }
        } else {
            logger.info("Firebase Admin SDK already initialized.")
        }
    }
}
