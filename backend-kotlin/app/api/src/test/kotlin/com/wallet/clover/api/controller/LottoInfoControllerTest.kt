package com.wallet.clover.api.controller

import com.wallet.clover.api.config.JwtBlacklistFilter
import com.wallet.clover.api.service.LottoInfoService
import com.wallet.clover.api.service.WinningNewsService
import kotlinx.coroutines.runBlocking
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.mockito.BDDMockito.given
import org.mockito.kotlin.any
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.reactive.WebFluxTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.security.test.web.reactive.server.SecurityMockServerConfigurers.mockJwt
import org.springframework.test.web.reactive.server.WebTestClient
import org.springframework.web.server.ServerWebExchange
import org.springframework.web.server.WebFilterChain

@WebFluxTest(LottoInfoController::class)
class LottoInfoControllerTest {

    @Autowired
    private lateinit var webTestClient: WebTestClient

    @MockBean
    private lateinit var lottoInfoService: LottoInfoService

    @MockBean
    private lateinit var winningNewsService: WinningNewsService

    @MockBean
    private lateinit var jwtBlacklistFilter: JwtBlacklistFilter

    @BeforeEach
    fun setUp() {
        given(jwtBlacklistFilter.filter(any(), any())).willAnswer { invocation ->
            val exchange = invocation.getArgument<ServerWebExchange>(0)
            val chain = invocation.getArgument<WebFilterChain>(1)
            chain.filter(exchange)
        }
    }

    @Test
    fun `getNextDrawInfo should return next draw info`() {
        val info = mapOf("round" to 1000, "date" to "2023-01-01")
        
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
            .jsonPath("$.success").isEqualTo(true)
            .jsonPath("$.data.round").isEqualTo(1000)
    }

    @Test
    fun `getRecentWinningNews should return list of news`() {
        val news = listOf(mapOf("title" to "News 1"))
        
        runBlocking {
            given(winningNewsService.getRecentWinningNews()).willReturn(news)
        }

        webTestClient
            .mutateWith(mockJwt())
            .get()
            .uri("/api/v1/lotto-info/news/recent")
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.success").isEqualTo(true)
            .jsonPath("$.data[0].title").isEqualTo("News 1")
    }
}
