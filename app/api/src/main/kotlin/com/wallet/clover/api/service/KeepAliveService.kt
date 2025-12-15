package com.wallet.clover.api.service

import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Service
import org.springframework.web.reactive.function.client.WebClient
import javax.annotation.PostConstruct

@Service
class KeepAliveService(
    private val webClientBuilder: WebClient.Builder,
    @Value("\${render.external-url:https://clover-wallet-api.onrender.com}")
    private val externalUrl: String
) {
    private val logger = LoggerFactory.getLogger(KeepAliveService::class.java)
    private lateinit var webClient: WebClient

    @PostConstruct
    fun init() {
        webClient = webClientBuilder.baseUrl(externalUrl).build()
    }

    // Ping every 14 minutes (14 * 60 * 1000 = 840000 ms)
    // Render Free Tier sleeps after 15 minutes of inactivity
    @Scheduled(fixedRate = 840000)
    fun pingSelf() {
        logger.info("KeepAlive: Pinging self at $externalUrl/actuator/health")
        
        webClient.get()
            .uri("/actuator/health")
            .retrieve()
            .toBodilessEntity()
            .subscribe(
                { logger.info("KeepAlive: Success - Server is awake") },
                { error -> logger.error("KeepAlive: Failed to ping self", error) }
            )
    }
}
