package com.wallet.clover.api.controller

import com.wallet.clover.api.service.LottoInfoService
import com.wallet.clover.api.service.WinningNewsService
import kotlinx.coroutines.runBlocking
import org.junit.jupiter.api.Test
import org.mockito.BDDMockito.given
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.reactive.AutoConfigureWebTestClient
import org.springframework.boot.test.autoconfigure.web.reactive.WebFluxTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.security.test.web.reactive.server.SecurityMockServerConfigurers.mockJwt
import org.springframework.test.web.reactive.server.WebTestClient
import java.time.LocalDateTime

@WebFluxTest(LottoInfoController::class)
@AutoConfigureWebTestClient
class LottoInfoControllerTest {

    @Autowired
    private lateinit var webTestClient: WebTestClient

    @MockBean
    private lateinit var lottoInfoService: LottoInfoService

    @MockBean
    private lateinit var winningNewsService: WinningNewsService

    @Test
    fun `getNextDrawInfo should return next draw info`() {
        val info = mapOf(
            "round" to 1000,
            "drawDate" to LocalDateTime.now(),
            "remainingTime" to 1000L
        )

        runBlocking {
            given(lottoInfoService.getNextDrawInfo()).willReturn(info)
        }

        webTestClient
            .mutateWith(mockJwt())
            .get()
            .uri("/api/v1/lotto-info/next-draw")
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.data.round").isEqualTo(1000)
    }

    @Test
    fun `getRecentWinningNews should return list of news`() {
        val news = mapOf(
            "round" to 1000,
            "numbers" to listOf(1, 2, 3, 4, 5, 6),
            "bonus" to 7
        )

        runBlocking {
            given(winningNewsService.getRecentWinningNews()).willReturn(listOf(news))
        }

        webTestClient
            .mutateWith(mockJwt())
            .get()
            .uri("/api/v1/lotto-info/news/recent")
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$[0].round").isEqualTo(1000)
    }
}
