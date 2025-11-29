package com.wallet.clover.api.client

import com.wallet.clover.api.client.LottoResponse
import org.springframework.stereotype.Component
import org.springframework.web.reactive.function.client.WebClient
import org.springframework.web.reactive.function.client.awaitBody

@Component
class LottoHistoryWebClient(
    private val webClientBuilder: WebClient.Builder,
) {
    private val webClient = webClientBuilder.baseUrl("https://www.dhlottery.co.kr").build()

    suspend fun getByGameNumber(gameNumber: Int): LottoResponse {
        return webClient.get()
            .uri { uriBuilder ->
                uriBuilder.path("/common.do")
                    .queryParam("method", "getLottoNumber")
                    .queryParam("drwNo", gameNumber)
                    .build()
            }
            .retrieve()
            .awaitBody<LottoResponse>()
    }
}
