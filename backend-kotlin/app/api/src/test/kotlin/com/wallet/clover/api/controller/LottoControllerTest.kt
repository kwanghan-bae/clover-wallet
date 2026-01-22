package com.wallet.clover.api.controller

import com.wallet.clover.api.common.PageResponse
import com.wallet.clover.api.config.JwtBlacklistFilter
import com.wallet.clover.api.domain.extraction.ExtractionMethod
import com.wallet.clover.api.dto.ExtractNumbers
import com.wallet.clover.api.dto.LottoGame
import com.wallet.clover.api.entity.game.LottoGameEntity
import com.wallet.clover.api.entity.game.LottoGameStatus
import com.wallet.clover.api.service.ExtractionService
import com.wallet.clover.api.service.LottoGameService
import kotlinx.coroutines.runBlocking
import org.junit.jupiter.api.Test
import org.mockito.BDDMockito.given
import org.mockito.kotlin.any
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.reactive.WebFluxTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.security.test.web.reactive.server.SecurityMockServerConfigurers.csrf
import org.springframework.security.test.web.reactive.server.SecurityMockServerConfigurers.mockJwt
import org.springframework.test.web.reactive.server.WebTestClient
import java.time.LocalDateTime

import org.junit.jupiter.api.BeforeEach
import org.springframework.web.server.ServerWebExchange
import org.springframework.web.server.WebFilterChain

@WebFluxTest(LottoController::class)
class LottoControllerTest {

    @Autowired
    private lateinit var webTestClient: WebTestClient

    @MockBean
    private lateinit var lottoGameService: LottoGameService

    @MockBean
    private lateinit var extractionService: ExtractionService

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
    fun `getMyGames should return list of games`() {
        val userId = 1L
        val games = listOf(
            LottoGameEntity(
                id = 1L,
                ticketId = 100L,
                userId = userId,
                status = LottoGameStatus.LOSING,
                number1 = 1, number2 = 2, number3 = 3, number4 = 4, number5 = 5, number6 = 6,
                createdAt = LocalDateTime.now()
            )
        )
        val pageResponse = PageResponse.of(games, 0, 20, 1)

        runBlocking {
            given(lottoGameService.getGamesByUserId(any(), any(), any())).willReturn(pageResponse)
        }

        webTestClient
            .mutateWith(mockJwt())
            .get()
            .uri("/api/v1/lotto/games?userId=$userId")
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.success").isEqualTo(true)
            .jsonPath("$.data.totalElements").isEqualTo(1)
    }

    @Test
    fun `saveGame should return saved game`() {
        val request = LottoGame.SaveRequest(
            userId = 1L,
            numbers = listOf(1, 2, 3, 4, 5, 6),
            extractionMethod = ExtractionMethod.STATISTICS_HOT
        )
        
        val savedEntity = LottoGameEntity(
            id = 1L,
            ticketId = 100L,
            userId = 1L,
            status = LottoGameStatus.LOSING,
            number1 = 1, number2 = 2, number3 = 3, number4 = 4, number5 = 5, number6 = 6,
            extractionMethod = ExtractionMethod.STATISTICS_HOT,
            createdAt = LocalDateTime.now()
        )

        runBlocking {
            given(lottoGameService.saveGeneratedGame(any())).willReturn(savedEntity)
        }

        webTestClient
            .mutateWith(csrf())
            .mutateWith(mockJwt())
            .post()
            .uri("/api/v1/lotto/games")
            .bodyValue(request)
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .consumeWith { result -> println(String(result.responseBody!!)) }
            .jsonPath("$.data.id").isEqualTo(1)
            .jsonPath("$.data.status").isEqualTo("LOSING")
    }

    @Test
    fun `extractNumbers should return extracted numbers`() {
        val request = ExtractNumbers.Request(
            method = ExtractionMethod.STATISTICS_HOT
        )
        
        val extractedNumbers = setOf(1, 2, 3, 4, 5, 6)

        runBlocking {
            given(extractionService.extractLottoNumbers(request)).willReturn(extractedNumbers)
        }

        webTestClient
            .mutateWith(csrf())
            .mutateWith(mockJwt())
            .post()
            .uri("/api/v1/lotto/extraction")
            .bodyValue(request)
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.data[0]").isEqualTo(1)
    }
}