package com.wallet.clover.api.client

import com.wallet.clover.api.client.LottoResponse
import kotlinx.coroutines.withTimeout
import org.springframework.stereotype.Component
import org.springframework.web.reactive.function.client.WebClient
import org.springframework.web.reactive.function.client.awaitBody
import kotlin.time.Duration.Companion.seconds

@Component
open class LottoHistoryWebClient(
    private val webClientBuilder: WebClient.Builder,
) {
    private val webClient = webClientBuilder.baseUrl("https://www.dhlottery.co.kr").build()

    suspend fun getByGameNumber(gameNumber: Int): LottoResponse = withTimeout(5.seconds) {
        webClient.get()
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
