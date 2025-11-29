package com.wallet.clover.api.adapter

import com.wallet.clover.api.adapter.LottoResponse
import org.springframework.stereotype.Component
import org.springframework.web.reactive.function.client.WebClient
import org.springframework.web.reactive.function.client.bodyToMono
import reactor.core.publisher.Mono

@Component
class LottoHistoryWebClient(
    private val webClientBuilder: WebClient.Builder,
) {
    private val webClient = webClientBuilder.baseUrl("https://www.dhlottery.co.kr").build()

    fun getByGameNumber(gameNumber: Int): Mono<LottoResponse> {
        return webClient.get()
            .uri { uriBuilder ->
                uriBuilder.path("/common.do")
                    .queryParam("method", "getLottoNumber")
                    .queryParam("drwNo", gameNumber)
                    .build()
            }
            .retrieve()
            .bodyToMono<LottoResponse>()
    }
}
