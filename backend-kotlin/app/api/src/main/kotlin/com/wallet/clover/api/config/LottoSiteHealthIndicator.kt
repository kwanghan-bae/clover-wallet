package com.wallet.clover.api.config

import org.springframework.boot.actuate.health.Health
import org.springframework.boot.actuate.health.ReactiveHealthIndicator
import org.springframework.stereotype.Component
import org.springframework.web.reactive.function.client.WebClient
import org.springframework.web.reactive.function.client.awaitBody
import reactor.core.publisher.Mono

@Component
class LottoSiteHealthIndicator(
    private val webClientBuilder: WebClient.Builder
) : ReactiveHealthIndicator {

    private val webClient = webClientBuilder.build()

    override fun health(): Mono<Health> {
        return webClient.get()
            .uri("https://www.dhlottery.co.kr/common.do?method=main")
            .retrieve()
            .toBodilessEntity()
            .map { 
                if (it.statusCode.is2xxSuccessful) {
                    Health.up().withDetail("url", "https://www.dhlottery.co.kr").build()
                } else {
                    Health.down().withDetail("status", it.statusCode).build()
                }
            }
            .onErrorResume { 
                Mono.just(Health.down(it as Exception).withDetail("url", "https://www.dhlottery.co.kr").build())
            }
    }
}
